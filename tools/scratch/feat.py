import json,sys
G=json.load(open('/home/user/legonrush-world/data/geography/legon-master.geojson'))
ML,MA=110778.848,110574
def ring(f):
  g=f['geometry']; c=g['coordinates'][0] if g['type']=='Polygon' else g['coordinates'][0][0]
  return [((lng+0.1871)*ML,(5.6518-lat)*MA) for lng,lat in c]
def feats(layers=('building',)):
  for f in G['features']:
    p=f['properties']
    if p.get('layer') not in layers or not f.get('geometry') or 'Polygon' not in f['geometry']['type']: continue
    r=ring(f); n=len(r)-1 or 1
    cx=sum(x for x,_ in r[:-1])/n; cz=sum(z for _,z in r[:-1])/n
    yield f,r,cx,cz
if __name__=='__main__':
  x0,x1,z0,z1=map(float,sys.argv[1:5]); lay=tuple(sys.argv[5].split(',')) if len(sys.argv)>5 else ('building',)
  for f,r,cx,cz in feats(lay):
    if x0<cx<x1 and z0<cz<z1:
      p=f['properties']; print(f['id'],p.get('layer'),p.get('class'),p.get('name',''),p.get('levels'),p.get('height'),'EXCL' if p.get('excluded') else '',round(cx,1),round(cz,1),'bb',[round(min(x for x,_ in r),1),round(max(x for x,_ in r),1),round(min(z for _,z in r),1),round(max(z for _,z in r),1)])
