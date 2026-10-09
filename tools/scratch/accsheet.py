import sys,json; sys.path.insert(0,sys.argv[0].rsplit('/',1)[0])
from geo import *
from PIL import Image, ImageDraw
A=json.load(open(REPO+'/data/geography/legon-access.geojson'))['features']
M=json.load(open(REPO+'/data/geography/legon-master.geojson'))['features']
L=json.load(open(REPO+'/src/data/legon-map.json'))
acc={f['properties']['place']:f for f in A if f['properties']['role']=='entrance'}
names=sys.argv[2].split('|'); out=sys.argv[1]; R=float(sys.argv[3]) if len(sys.argv)>3 else 110
ll=lambda c: local(c[1],c[0])
tiles=[]
for n in names:
    f=acc.get(n)
    if not f: print('missing',n); continue
    p=f['properties']; e=ll(f['geometry']['coordinates']); a=ll(p['arrival'])
    cx,cz=(e[0]+a[0])/2,(e[1]+a[1])/2
    c=Canvas(cx-R,cz-R,cx+R,cz+R,mpp=R/150,dim=0.75)
    N=L['nodes']
    for r in L['roads']: c.line([(N[i*2]/10,N[i*2+1]/10) for i in r['w']],(255,255,255,200) if r['c']<4 else (0,230,255,220),2 if r['c']<4 else 1)
    for b in L['buildings']:
        q=b['p']; c.poly([(q[i]/10,q[i+1]/10) for i in range(0,len(q),2)],outline=(255,90,90,230))
    if p.get('footprint'):
        for g in M:
            if g['id']==p['footprint'] and g['geometry']['type']=='Polygon': c.poly([ll(v) for v in g['geometry']['coordinates'][0]],outline=(255,255,0,255),w=2)
    c.line([e,a],(255,0,255,255),2)
    if p.get('dropoff'): d=ll(p['dropoff']); c.dot(*d,(255,140,0,255),4)
    c.dot(*a,(0,255,0,255),5); c.dot(*e,(255,0,255,255),5)
    c.text(cx-R+4,cz-R+4,f"{n[:34]}"); c.text(cx-R+4,cz-R+18,f"{p['method']} {p['confidence']} {p['entranceType']}")
    c.text(cx-R+4,cz+R-16,f"arr on {str(p.get('arrivalWayName') or p['arrivalWayClass'])[:26]}")
    path=f"{out}_{len(tiles)}.png"; c.save(path); tiles.append(path)
W=4; im=[Image.open(t) for t in tiles]; w,h=im[0].size
sheet=Image.new('RGB',(w*W,h*((len(im)+W-1)//W)))
for i,t in enumerate(im): sheet.paste(t,((i%W)*w,(i//W)*h))
sheet.save(out+'.png'); print(sheet.size)
