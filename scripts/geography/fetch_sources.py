"""Fetch and clip the independent geographic sources used to reconstruct the Legon campus.

This is the *acquisition* step only; it is run by hand when the sources should be refreshed
and its outputs are committed under data/geography/sources/. The build itself
(scripts/geography/build-master.mjs) is plain Node and never touches the network.

Needs Python 3.11+ with: pyarrow shapely numpy pillow rasterio pyproj
    python3 -m venv .venv-geo && .venv-geo/bin/pip install pyarrow shapely numpy pillow rasterio pyproj
    .venv-geo/bin/python scripts/geography/fetch_sources.py

Sources (all openly licensed, see docs/LEGON_MASTER_GEOGRAPHY.md):
  * Overture Maps release (S3, anonymous): buildings, transportation, base, places
  * Google Open Buildings v3 (GCS): satellite-derived building footprints
  * Sentinel-2 L2A true-colour COGs (AWS open data): cloud-free median composite
  * Copernicus GLO-30 DEM (AWS open data): terrain
  * ESA WorldCover 2021 v200 (AWS open data): land cover
"""
import csv, gzip, io, json, math, os, sys, urllib.request
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'data', 'geography', 'sources')
os.environ.setdefault('CURL_CA_BUNDLE', os.environ.get('SSL_CERT_FILE', '/etc/ssl/certs/ca-certificates.crt'))
os.environ['GDAL_DISABLE_READDIR_ON_OPEN'] = 'EMPTY_DIR'

# study extent: the legacy OSM extract plus the whole OSM campus boundary (way 308668766) + ~200 m
W, S, E, N = -0.2070, 5.6240, -0.1670, 5.6695
OVERTURE_RELEASE = '2026-09-23.1'
# the game frame (kept from the legacy map): metres east/south of this fixed datum point
LAT0, LNG0 = 5.6518, -0.1871
M_LAT = 110574.0
M_LNG = 111320.0 * math.cos(math.radians(LAT0))
r6 = lambda v: round(v, 6)


def osm_campus_boundary():
    """the University of Ghana campus outline from the committed OSM extract"""
    import xml.etree.ElementTree as ET
    from shapely.geometry import Polygon
    root = ET.parse(os.path.join(ROOT, 'data', 'legon.osm')).getroot()
    nodes = {e.get('id'): (float(e.get('lon')), float(e.get('lat'))) for e in root if e.tag == 'node'}
    for e in root:
        if e.tag == 'way' and e.get('id') == '308668766':
            return Polygon([nodes[c.get('ref')] for c in e if c.tag == 'nd'])
    raise SystemExit('campus boundary way 308668766 missing from data/legon.osm')


def osm_ids():
    """ids of every way and relation already in the OSM extract (to avoid duplicates from Overture)"""
    import re
    xml = open(os.path.join(ROOT, 'data', 'legon.osm'), encoding='utf8').read()
    return {'w' + m for m in re.findall(r'<way id="(\d+)"', xml)} | {'r' + m for m in re.findall(r'<relation id="(\d+)"', xml)}


def write_fc(name, feats, meta):
    path = os.path.join(OUT, name)
    with open(path, 'w') as f:
        json.dump({'type': 'FeatureCollection', 'metadata': meta, 'features': feats}, f, separators=(',', ':'))
    print(f'{name}: {len(feats)} features, {os.path.getsize(path) / 1024:.0f} KB')


def rounded(geom):
    from shapely.geometry import mapping
    from shapely import set_precision
    return mapping(set_precision(geom, 1e-6))


def overture():
    import pyarrow.dataset as ds, pyarrow.fs as pfs, pyarrow.compute as pc
    from shapely import wkb
    from shapely.geometry import box
    fs = pfs.S3FileSystem(anonymous=True, region='us-west-2')
    ext = box(W, S, E, N)
    campus = osm_campus_boundary()
    near_campus = campus.buffer(0.0012)  # ~130 m
    have = osm_ids()

    def table(theme, typ, cols):
        d = ds.dataset(f'overturemaps-us-west-2/release/{OVERTURE_RELEASE}/theme={theme}/type={typ}/', filesystem=fs, format='parquet')
        f = (pc.field('bbox', 'xmin') < E) & (pc.field('bbox', 'xmax') > W) & (pc.field('bbox', 'ymin') < N) & (pc.field('bbox', 'ymax') > S)
        return d.to_table(columns=[c for c in cols if c in d.schema.names] + ['geometry'], filter=f).to_pylist()

    def osm_ref(src):
        rid = (src or {}).get('record_id') or ''
        return rid.split('@')[0] if src and src.get('dataset') == 'OpenStreetMap' else None

    supplement, ml = [], []
    for r in table('transportation', 'segment', ['id', 'names', 'subtype', 'class', 'subclass', 'sources']):
        ref = osm_ref(r['sources'][0])
        g = wkb.loads(r['geometry'])
        if not ref or ref in have or not g.intersects(ext):
            continue
        supplement.append({'type': 'Feature', 'properties': {'layer': 'segment', 'osm': ref, 'subtype': r['subtype'], 'class': r['class'], 'subclass': r.get('subclass'), 'name': (r['names'] or {}).get('primary')}, 'geometry': rounded(g.intersection(ext))})
    for r in table('buildings', 'building', ['id', 'names', 'class', 'subtype', 'height', 'num_floors', 'sources']):
        g = wkb.loads(r['geometry'])
        if not g.intersects(ext):
            continue
        src = r['sources'][0]
        ref = osm_ref(src)
        props = {'name': (r['names'] or {}).get('primary'), 'class': r['class'], 'height': r['height'], 'floors': r['num_floors']}
        if ref:
            if ref in have:
                continue
            supplement.append({'type': 'Feature', 'properties': {'layer': 'building', 'osm': ref, **props}, 'geometry': rounded(g)})
        elif g.intersects(near_campus):  # machine-learned footprints only on and right around campus
            ml.append({'type': 'Feature', 'properties': {'dataset': src['dataset'], 'confidence': src.get('confidence'), 'id': r['id']}, 'geometry': rounded(g)})
    for typ, layer in (('land_use', 'landuse'), ('water', 'water')):
        for r in table('base', typ, ['id', 'names', 'subtype', 'class', 'sources']):
            ref = osm_ref(r['sources'][0])
            g = wkb.loads(r['geometry'])
            if not ref or ref in have or not g.intersects(ext) or g.area > 0.01:  # skip huge regional polygons
                continue
            supplement.append({'type': 'Feature', 'properties': {'layer': layer, 'osm': ref, 'subtype': r['subtype'], 'class': r['class'], 'name': (r['names'] or {}).get('primary')}, 'geometry': rounded(g)})
    meta = {'source': f'Overture Maps Foundation release {OVERTURE_RELEASE}', 'license': 'ODbL-1.0 (OpenStreetMap-derived features)', 'extent': [W, S, E, N],
            'note': 'OpenStreetMap features present in the Overture release but missing from data/legon.osm (the legacy extract stops at 5.633-5.668 N, 0.199-0.175 W)'}
    write_fc('overture-osm-supplement.geojson', supplement, meta)
    write_fc('overture-ml-buildings.geojson', ml, {'source': f'Overture Maps Foundation release {OVERTURE_RELEASE}', 'license': 'Google Open Buildings: CC-BY-4.0 / ODbL; Microsoft ML Buildings: ODbL', 'extent': [W, S, E, N],
                                                   'note': 'machine-learned footprints (Google Open Buildings, Microsoft ML Buildings) not conflated with any OSM building, within ~130 m of the campus'})
    places = []
    for r in table('places', 'place', ['id', 'names', 'categories', 'basic_category', 'confidence', 'sources']):
        g = wkb.loads(r['geometry'])
        name = (r['names'] or {}).get('primary')
        if not name or not g.intersects(near_campus):
            continue
        places.append({'type': 'Feature', 'properties': {'name': name, 'category': r.get('basic_category') or (r.get('categories') or {}).get('primary'), 'confidence': round(r['confidence'] or 0, 3), 'dataset': r['sources'][0]['dataset'], 'id': r['id']}, 'geometry': rounded(g)})
    write_fc('overture-places.geojson', places, {'source': f'Overture Maps Foundation release {OVERTURE_RELEASE}', 'license': 'CDLA-Permissive-2.0', 'note': 'named places (Meta, Microsoft, Foursquare, AllThePlaces) within ~130 m of the campus'})


def google_open_buildings():
    """Google Open Buildings v3, S2 level-4 cell 0fd (covers Accra), streamed and clipped to the campus"""
    from shapely import wkt
    campus = osm_campus_boundary().buffer(0.0009)
    url = 'https://storage.googleapis.com/open-buildings-data/v3/polygons_s2_level_4_gzip/0fd_buildings.csv.gz'
    feats = []
    with urllib.request.urlopen(url) as resp:
        rows = csv.DictReader(io.TextIOWrapper(gzip.GzipFile(fileobj=resp), encoding='utf8'))
        for r in rows:
            lat, lng = float(r['latitude']), float(r['longitude'])
            if not (S < lat < N and W < lng < E) or float(r['confidence']) < 0.65:
                continue
            g = wkt.loads(r['geometry'])
            if not g.intersects(campus):
                continue
            feats.append({'type': 'Feature', 'properties': {'confidence': float(r['confidence']), 'area': round(float(r['area_in_meters']), 1)}, 'geometry': rounded(g)})
    write_fc('google-open-buildings.geojson', feats, {'source': 'Google Open Buildings v3 (polygons_s2_level_4, cell 0fd)', 'license': 'CC-BY-4.0 / ODbL', 'note': 'footprints with confidence >= 0.65 within ~100 m of the campus; used to validate the OSM footprints'})


def warp_to_frame(src, band_read, mpp, x0, z0, x1, z1, resampling='bilinear'):
    """sample a raster (any CRS) onto the game's local frame grid"""
    from pyproj import Transformer
    tr = Transformer.from_crs(4326, src.crs, always_xy=True)
    cols = int(round((x1 - x0) / mpp)); rows = int(round((z1 - z0) / mpp))
    X, Z = np.meshgrid(x0 + (np.arange(cols) + .5) * mpp, z0 + (np.arange(rows) + .5) * mpp)
    lat = LAT0 - Z / M_LAT; lng = LNG0 + X / M_LNG
    ex, ny = tr.transform(lng, lat)
    c, r = (~src.transform) * (ex, ny)
    a = band_read
    if resampling == 'nearest':
        return a[..., np.clip(np.floor(r).astype(int), 0, a.shape[-2] - 1), np.clip(np.floor(c).astype(int), 0, a.shape[-1] - 1)]
    c = np.clip(c - .5, 0, a.shape[-1] - 1.001); r = np.clip(r - .5, 0, a.shape[-2] - 1.001)
    c0 = c.astype(int); r0 = r.astype(int); fc = c - c0; fr = r - r0
    A = a.astype(float)
    return A[..., r0, c0] * (1 - fc) * (1 - fr) + A[..., r0, c0 + 1] * fc * (1 - fr) + A[..., r0 + 1, c0] * (1 - fc) * fr + A[..., r0 + 1, c0 + 1] * fc * fr


def frame_extent(step):
    x0 = math.floor((W - LNG0) * M_LNG / step) * step; x1 = math.ceil((E - LNG0) * M_LNG / step) * step
    z0 = math.floor(-(N - LAT0) * M_LAT / step) * step; z1 = math.ceil(-(S - LAT0) * M_LAT / step) * step
    return x0, z0, x1, z1


def sentinel2():
    """cloud-free median of clear dry-season Sentinel-2 L2A true-colour scenes, warped to the game frame at 5 m/px"""
    import rasterio
    from rasterio.windows import from_bounds
    from pyproj import Transformer
    from PIL import Image
    tr = Transformer.from_crs(4326, 32630, always_xy=True)
    xs, ys = zip(*[tr.transform(x, y) for x in (W, E) for y in (S, N)])
    bounds = (min(xs) - 50, min(ys) - 50, max(xs) + 50, max(ys) + 50)
    base = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/'
    scenes = []
    for month in ('2025/11', '2025/12', '2026/1', '2026/2'):
        listing = urllib.request.urlopen(f'{base}?list-type=2&prefix=sentinel-s2-l2a-cogs/30/N/ZM/{month}/&delimiter=/').read().decode()
        scenes += [p for p in __import__('re').findall(r'<Prefix>([^<]+)</Prefix>', listing) if p.count('/') == 7]
    stack, used, tf, crs = [], [], None, None
    for p in sorted(scenes):
        try:
            with rasterio.open(f'/vsicurl/{base}{p}TCI.tif') as r:
                w = from_bounds(*bounds, transform=r.transform).round_offsets().round_lengths()
                a = r.read(window=w)
                if tf is None:
                    tf, crs, shape = r.window_transform(w), r.crs, a.shape
        except Exception as e:  # noqa: BLE001
            print('skip', p, e); continue
        if a.shape != shape or (a == 0).mean() > 0.05 or (a.min(0) > 170).mean() > 0.02:
            continue  # partial swath or cloud over campus
        stack.append(a); used.append(p.rstrip('/').split('/')[-1])
    print('clear Sentinel-2 scenes:', used)
    med = np.median(np.stack(stack), axis=0)

    class Src:  # minimal raster-like object for warp_to_frame
        pass
    src = Src(); src.crs = crs; src.transform = tf
    x0, z0, x1, z1 = frame_extent(50)
    img = warp_to_frame(src, med, 5, x0, z0, x1, z1)
    img = np.clip(img * 1.55, 0, 255).astype(np.uint8).transpose(1, 2, 0)
    path = os.path.join(ROOT, 'public', 'geo', 'legon-sentinel2.webp')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(img).save(path, quality=82, method=6)
    json.dump({'source': 'Copernicus Sentinel-2 L2A true colour (TCI), Element 84 / AWS open data', 'license': 'Copernicus Sentinel data, free and open; contains modified Copernicus Sentinel data 2025-2026',
               'scenes': used, 'method': 'per-pixel median of clear scenes, x1.55 brightness', 'frame': {'origin': [LAT0, LNG0], 'x0': x0, 'z0': z0, 'x1': x1, 'z1': z1, 'metresPerPixel': 5},
               'image': 'public/geo/legon-sentinel2.webp'}, open(os.path.join(OUT, 'sentinel2-composite.json'), 'w'), indent=1)
    print('sentinel-2 composite', img.shape, f'{os.path.getsize(path) / 1024:.0f} KB')


def dem():
    """Copernicus GLO-30 surface model sampled on a 30 m grid in the game frame (decimetres)"""
    import rasterio
    u = '/vsicurl/https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_N05_00_W001_00_DEM/Copernicus_DSM_COG_10_N05_00_W001_00_DEM.tif'
    with rasterio.open(u) as r:
        from rasterio.windows import from_bounds
        w = from_bounds(W - .002, S - .002, E + .002, N + .002, transform=r.transform).round_offsets().round_lengths()
        a = r.read(1, window=w)

        class Src:
            pass
        src = Src(); src.crs = r.crs; src.transform = r.window_transform(w)
    x0, z0, x1, z1 = frame_extent(30)
    g = warp_to_frame(src, a[None], 30, x0, z0, x1, z1)[0]
    json.dump({'source': 'Copernicus GLO-30 DEM (DSM), tile N05 W001, AWS open data', 'license': 'Copernicus DEM, free and open (GLO-30 public)',
               'note': 'surface model: includes tree canopy and roofs (+/- several metres); heights in decimetres above EGM2008',
               'frame': {'origin': [LAT0, LNG0], 'x0': x0, 'z0': z0, 'step': 30, 'cols': g.shape[1], 'rows': g.shape[0]},
               'dm': [int(round(v * 10)) for v in g.ravel()]}, open(os.path.join(OUT, 'copernicus-dem-30m.json'), 'w'), separators=(',', ':'))
    print('dem grid', g.shape, f'{g.min():.0f}-{g.max():.0f} m')


def worldcover():
    """ESA WorldCover 2021 (10 m) land cover on campus, vectorised on a 20 m majority grid"""
    import rasterio
    from rasterio import features
    from shapely.geometry import shape, mapping
    from shapely.ops import unary_union, transform as stransform
    u = '/vsicurl/https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N03W003_Map.tif'
    with rasterio.open(u) as r:
        from rasterio.windows import from_bounds
        w = from_bounds(W, S, E, N, transform=r.transform).round_offsets().round_lengths()
        a = r.read(1, window=w); tf = r.window_transform(w)
    # 3x3 majority filter removes single-pixel speckle
    from collections import Counter
    pad = np.pad(a, 1, mode='edge'); out = a.copy()
    for i in range(a.shape[0]):
        for j in range(a.shape[1]):
            out[i, j] = Counter(pad[i:i + 3, j:j + 3].ravel().tolist()).most_common(1)[0][0]
    campus = osm_campus_boundary()
    NAMES = {10: 'tree_cover', 20: 'shrubland', 30: 'grassland', 40: 'cropland', 50: 'built_up', 60: 'bare', 80: 'water', 90: 'wetland'}
    feats = []
    for cls, name in NAMES.items():
        polys = [shape(g) for g, v in features.shapes(out, mask=(out == cls), transform=tf) if v == cls]
        if not polys:
            continue
        geom = unary_union(polys).intersection(campus).simplify(0.00006)
        parts = getattr(geom, 'geoms', [geom])
        for p in parts:
            if p.area * M_LAT * M_LNG < 2500:  # under a quarter hectare
                continue
            feats.append({'type': 'Feature', 'properties': {'class': name, 'ha': round(p.area * M_LAT * M_LNG / 1e4, 2)}, 'geometry': rounded(p)})
    write_fc('esa-worldcover-campus.geojson', feats, {'source': 'ESA WorldCover 10 m 2021 v200', 'license': 'CC-BY-4.0, (c) ESA WorldCover project 2021', 'note': '3x3 majority filtered, clipped to the OSM campus boundary, patches >= 0.25 ha'})


if __name__ == '__main__':
    steps = sys.argv[1:] or ['overture', 'gob', 's2', 'dem', 'worldcover']
    os.makedirs(OUT, exist_ok=True)
    for s in steps:
        {'overture': overture, 'gob': google_open_buildings, 's2': sentinel2, 'dem': dem, 'worldcover': worldcover}[s]()
