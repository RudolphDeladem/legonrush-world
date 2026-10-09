import pyarrow.dataset as ds, pyarrow.fs as pfs, pyarrow.compute as pc, json, sys, shapely
from shapely import wkb
REL='2026-09-23.1'
W,S,E,N=-0.2085,5.6220,-0.1650,5.6710
fs=pfs.S3FileSystem(anonymous=True, region='us-west-2')
OUT=sys.argv[0].rsplit('/',1)[0]+'/src/'
def q(theme,typ,cols,out):
    d=ds.dataset(f'overturemaps-us-west-2/release/{REL}/theme={theme}/type={typ}/', filesystem=fs, format='parquet')
    b=pc.field('bbox')
    f=(pc.field('bbox','xmin')<E)&(pc.field('bbox','xmax')>W)&(pc.field('bbox','ymin')<N)&(pc.field('bbox','ymax')>S)
    names=d.schema.names
    t=d.to_table(columns=[c for c in cols if c in names]+['geometry'], filter=f)
    feats=[]
    for r in t.to_pylist():
        g=wkb.loads(r.pop('geometry'))
        feats.append({'type':'Feature','properties':r,'geometry':shapely.geometry.mapping(g)})
    json.dump({'type':'FeatureCollection','features':feats},open(OUT+out,'w'),default=str)
    print('ok',out,len(feats),flush=True)
C={'places':('places','place',['id','names','categories','confidence','sources','addresses','websites']),
   'buildings':('buildings','building',['id','names','class','subtype','height','num_floors','sources']),
   'segments':('transportation','segment',['id','names','subtype','class','sources','road_surface']),
   'landuse':('base','land_use',['id','names','subtype','class','sources']),
   'water':('base','water',['id','names','subtype','class','sources']),
   'infra':('base','infrastructure',['id','names','subtype','class','sources']),
   'landcover':('base','land_cover',['id','subtype','sources'])}
for k in sys.argv[1:]:
    th,ty,cols=C[k]; q(th,ty,cols,f'ov_{k}.geojson')
