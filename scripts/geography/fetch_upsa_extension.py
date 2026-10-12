"""Fetch the UPSA extension: OpenStreetMap features (via Overture) east of the Legon study extent.

The University of Professional Studies, Accra (UPSA) stands north of IPS Road, east of PRESEC, mostly beyond the
study extent of fetch_sources.py (which stops at 0.1670 W and keeps only what lies within 150 m of the UG campus).
The route from the UPSA Hostel along IPS Road through the UPSA Main Gate to the academic core needs that ground, so
this separately sourced, provenance-tagged extension adds it without moving or relabelling anything in the Legon
sources (docs/upsa-hostel-to-school/evidence-audit.md).

Writes data/geography/sources/upsa-extension.geojson in the supplement's schema (layer, osm, subtype, class, ...),
geometry unclipped so that roads leaving the box stay whole:
  * segment:  roads and paths (OSM ways)
  * building: OSM buildings; machine-learned footprints (Google Open Buildings, Microsoft) only inside the UPSA campus
              polygon (OSM way 309660062), as the UG campus keeps them only inside its own boundary
  * landuse:  land use and parking polygons; barrier: walls and gates (OSM ways and nodes)
  * place:    named places, for the evidence audit only (build-master.mjs does not turn them into destinations)

Needs Python 3.11+ with pyarrow and shapely (see fetch_sources.py).
    .venv-geo/bin/python scripts/geography/fetch_upsa_extension.py
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'data', 'geography', 'sources', 'upsa-extension.geojson')
OVERTURE_RELEASE = '2026-09-23.1'
# the UPSA box: game x 1950-2559, z -1376..-635 (IPS Road from x 1950 to the New Road junction, the frontage south of
# it, the whole UPSA campus north of it)
W, S, E, N = -0.1695, 5.6575, -0.1640, 5.6642
UPSA_CAMPUS_WAY = 'w309660062'


def main():
    import pyarrow.dataset as ds, pyarrow.fs as pfs, pyarrow.compute as pc
    from shapely import wkb, set_precision
    from shapely.geometry import box, mapping
    fs = pfs.S3FileSystem(anonymous=True, region='us-west-2')
    ext = box(W, S, E, N)

    def table(theme, typ, cols):
        d = ds.dataset(f'overturemaps-us-west-2/release/{OVERTURE_RELEASE}/theme={theme}/type={typ}/', filesystem=fs, format='parquet')
        f = (pc.field('bbox', 'xmin') < E) & (pc.field('bbox', 'xmax') > W) & (pc.field('bbox', 'ymin') < N) & (pc.field('bbox', 'ymax') > S)
        rows = d.to_table(columns=[c for c in cols if c in d.schema.names] + ['geometry'], filter=f).to_pylist()
        return [(r, wkb.loads(r['geometry'])) for r in rows]

    def osm_ref(src):
        rid = (src or {}).get('record_id') or ''
        return rid.split('@')[0] if src and src.get('dataset') == 'OpenStreetMap' else None

    geo = lambda g: mapping(set_precision(g, 1e-7))
    name = lambda r: (r.get('names') or {}).get('primary')
    feats = []
    landuse = table('base', 'land_use', ['id', 'names', 'subtype', 'class', 'sources'])
    campus = next(g for r, g in landuse if osm_ref(r['sources'][0]) == UPSA_CAMPUS_WAY)
    for r, g in table('transportation', 'segment', ['id', 'names', 'subtype', 'class', 'subclass', 'sources']):
        ref = osm_ref(r['sources'][0])
        if ref and g.intersects(ext):
            feats.append({'type': 'Feature', 'properties': {'layer': 'segment', 'osm': ref, 'subtype': r['subtype'], 'class': r['class'], 'subclass': r.get('subclass'), 'name': name(r)}, 'geometry': geo(g)})
    for r, g in table('buildings', 'building', ['id', 'names', 'class', 'subtype', 'height', 'num_floors', 'sources']):
        if not g.intersects(ext):
            continue
        src = r['sources'][0]
        ref = osm_ref(src)
        props = {'name': name(r), 'class': r['class'], 'height': r['height'], 'floors': r['num_floors']}
        if ref:
            feats.append({'type': 'Feature', 'properties': {'layer': 'building', 'osm': ref, **props}, 'geometry': geo(g)})
        elif campus.contains(g.centroid):
            feats.append({'type': 'Feature', 'properties': {'layer': 'ml-building', 'dataset': src['dataset'], 'confidence': src.get('confidence'), 'id': r['id']}, 'geometry': geo(g)})
    for r, g in landuse:
        ref = osm_ref(r['sources'][0])
        if ref and g.intersects(ext) and g.area < 0.01:
            feats.append({'type': 'Feature', 'properties': {'layer': 'landuse', 'osm': ref, 'subtype': r['subtype'], 'class': r['class'], 'name': name(r)}, 'geometry': geo(g)})
    for r, g in table('base', 'infrastructure', ['id', 'names', 'subtype', 'class', 'sources']):
        ref = osm_ref(r['sources'][0])
        if not ref or not g.intersects(ext):
            continue
        if r['class'] == 'parking' and g.geom_type in ('Polygon', 'MultiPolygon'):
            feats.append({'type': 'Feature', 'properties': {'layer': 'landuse', 'osm': ref, 'subtype': r['subtype'], 'class': 'parking', 'name': name(r)}, 'geometry': geo(g)})
        elif r['subtype'] == 'barrier' or r['class'] == 'bus_stop':
            feats.append({'type': 'Feature', 'properties': {'layer': 'barrier' if r['subtype'] == 'barrier' else 'stop', 'osm': ref, 'class': r['class'], 'name': name(r)}, 'geometry': geo(g)})
    for r, g in table('places', 'place', ['id', 'names', 'categories', 'basic_category', 'confidence', 'sources']):
        if name(r) and g.intersects(ext):
            feats.append({'type': 'Feature', 'properties': {'layer': 'place', 'name': name(r), 'category': r.get('basic_category') or (r.get('categories') or {}).get('primary'), 'confidence': round(r['confidence'] or 0, 3), 'dataset': r['sources'][0]['dataset'], 'id': r['id']}, 'geometry': geo(g)})
    meta = {'source': f'Overture Maps Foundation release {OVERTURE_RELEASE}', 'license': 'ODbL-1.0 (OpenStreetMap-derived features); CDLA-Permissive-2.0 (places); CC-BY-4.0 / ODbL (machine-learned footprints)',
            'extent': [W, S, E, N], 'campusWay': UPSA_CAMPUS_WAY,
            'note': 'the UPSA extension: OpenStreetMap features east of the Legon study extent, for the UPSA Hostel to UPSA campus route (docs/upsa-hostel-to-school/evidence-audit.md)'}
    with open(OUT, 'w') as f:
        json.dump({'type': 'FeatureCollection', 'metadata': meta, 'features': feats}, f, separators=(',', ':'))
    by = {}
    for x in feats:
        by[x['properties']['layer']] = by.get(x['properties']['layer'], 0) + 1
    print(f'upsa-extension.geojson: {len(feats)} features {by}, {os.path.getsize(OUT) / 1024:.0f} KB')


if __name__ == '__main__':
    main()
