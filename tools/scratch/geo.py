import json, math, csv, os, re, numpy as np
import xml.etree.ElementTree as ET
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFont
from shapely import wkt
D=os.path.dirname(os.path.abspath(__file__)); REPO='/home/user/legonrush-world'
LAT0,LNG0=5.6518,-0.1871
M_LAT=110574; M_LNG=111320*math.cos(math.radians(LAT0))
def local(lat,lng): return ((lng-LNG0)*M_LNG, -(lat-LAT0)*M_LAT)
def latlng(x,z): return (LAT0 - z/M_LAT, LNG0 + x/M_LNG)

@lru_cache
def osm():
    t=ET.parse(REPO+'/data/legon.osm').getroot()
    nodes={}; ntags={}; ways={}; rels={}
    for e in t:
        tags={c.get('k'):c.get('v') for c in e if c.tag=='tag'}
        if e.tag=='node':
            nodes[e.get('id')]=(float(e.get('lat')),float(e.get('lon')))
            if tags: ntags[e.get('id')]=tags
        elif e.tag=='way':
            ways[e.get('id')]={'refs':[c.get('ref') for c in e if c.tag=='nd'],'t':tags}
        elif e.tag=='relation':
            rels[e.get('id')]={'m':[(c.get('type'),c.get('ref'),c.get('role')) for c in e if c.tag=='member'],'t':tags}
    return nodes,ntags,ways,rels
def gj(name): return json.load(open(f'{D}/src/{name}.geojson'))['features']
@lru_cache
def gob():
    out=[]
    for r in csv.DictReader(open(D+'/src/gob_legon.csv')):
        out.append((float(r['latitude']),float(r['longitude']),float(r['area_in_meters']),float(r['confidence']),r['geometry']))
    return out
def ugpois(): return json.load(open(REPO+'/data/ug-campus-map-pois.json'))
def ovname(p):
    n=p.get('names'); return n.get('primary') if isinstance(n,dict) else None

# ---- S2 underlay warped into the local frame ----
@lru_cache
def s2():
    import rasterio
    r=rasterio.open(D+'/src/s2_legon_utm30.tif'); return r.read(), r.transform
def underlay(x0,z0,x1,z1,mpp,boost=1.7):
    from pyproj import Transformer
    a,tf=s2(); tr=Transformer.from_crs(4326,32630,always_xy=True)
    W=int((x1-x0)/mpp); H=int((z1-z0)/mpp)
    xs=x0+(np.arange(W)+.5)*mpp; zs=z0+(np.arange(H)+.5)*mpp
    X,Z=np.meshgrid(xs,zs)
    lat=LAT0-Z/M_LAT; lng=LNG0+X/M_LNG
    E,N=tr.transform(lng,lat)
    inv=~tf; c,r=inv*(E,N)
    # bilinear
    c=np.clip(c-.5,0,a.shape[2]-1.001); r=np.clip(r-.5,0,a.shape[1]-1.001)
    c0=c.astype(int); r0=r.astype(int); fc=c-c0; fr=r-r0
    img=np.zeros((H,W,3))
    for b in range(3):
        A=a[b].astype(float)
        img[...,b]=(A[r0,c0]*(1-fc)*(1-fr)+A[r0,c0+1]*fc*(1-fr)+A[r0+1,c0]*(1-fc)*fr+A[r0+1,c0+1]*fc*fr)
    img=np.clip(img*boost,0,255).astype(np.uint8)
    return Image.fromarray(img)

class Canvas:
    def __init__(s,x0,z0,x1,z1,mpp=2,bg='s2',dim=1.0):
        s.x0,s.z0,s.mpp=x0,z0,mpp
        if bg=='s2':
            s.im=underlay(x0,z0,x1,z1,mpp)
            if dim!=1: s.im=Image.eval(s.im,lambda v:int(v*dim))
        else: s.im=Image.new('RGB',(int((x1-x0)/mpp),int((z1-z0)/mpp)),bg)
        s.im=s.im.convert('RGBA'); s.ov=Image.new('RGBA',s.im.size,(0,0,0,0)); s.d=ImageDraw.Draw(s.ov)
        try: s.font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',11)
        except: s.font=ImageFont.load_default()
    def px(s,x,z): return ((x-s.x0)/s.mpp,(z-s.z0)/s.mpp)
    def line(s,pts,fill,w=1): s.d.line([s.px(*p) for p in pts],fill=fill,width=w)
    def poly(s,pts,outline=None,fill=None,w=1):
        if len(pts)>2: s.d.polygon([s.px(*p) for p in pts],outline=outline,fill=fill,width=w)
    def dot(s,x,z,fill,r=3,label=None,lc=(255,255,255,255)):
        X,Y=s.px(x,z); s.d.ellipse([X-r,Y-r,X+r,Y+r],fill=fill,outline=(0,0,0,255))
        if label: s.d.text((X+r+2,Y-6),label,fill=lc,font=s.font,stroke_width=2,stroke_fill=(0,0,0,255))
    def text(s,x,z,t,fill=(255,255,255,255)):
        X,Y=s.px(x,z); s.d.text((X,Y),t,fill=fill,font=s.font,stroke_width=2,stroke_fill=(0,0,0,255))
    def grid(s,step=500):
        W,H=s.im.size
        x=math.ceil(s.x0/step)*step
        while (x-s.x0)/s.mpp<W: X=(x-s.x0)/s.mpp; s.d.line([(X,0),(X,H)],fill=(255,255,0,60)); s.d.text((X+2,2),str(int(x)),fill=(255,255,0,200),font=s.font); x+=step
        z=math.ceil(s.z0/step)*step
        while (z-s.z0)/s.mpp<H: Y=(z-s.z0)/s.mpp; s.d.line([(0,Y),(W,Y)],fill=(255,255,0,60)); s.d.text((2,Y+2),str(int(z)),fill=(255,255,0,200),font=s.font); z+=step
    def save(s,path): Image.alpha_composite(s.im,s.ov).convert('RGB').save(path)

def osm_way_pts(w):
    nodes=osm()[0]; return [local(*nodes[r]) for r in w['refs'] if r in nodes]
