# local registration of the user's satellite atlas (north-up screenshots) to the game frame
import sys, json, numpy as np
sys.path.insert(0, sys.argv[0].rsplit('/',1)[0] if '/' in sys.argv[0] else '.')
from geo import *
from PIL import Image, ImageDraw
IMG={1:np.asarray(Image.open('/tmp/claude-0/-home-user-legonrush-world/afde20e7-2667-59fa-8c1a-7cae30d15f52/images/1.jpg').convert('RGB')).astype(float),
     2:np.asarray(Image.open('/tmp/claude-0/-home-user-legonrush-world/afde20e7-2667-59fa-8c1a-7cae30d15f52/images/2.jpg').convert('RGB')).astype(float)}
# rough global fits (pixel -> local), from control points
CP={1:([(818,888),(1240,1030),(1085,1160),(885,322),(955,930)],[(395,1310),(777,1412),(631,1560),(640,795),(518,1334)]),
    2:([(560,985),(968,1540),(772,1470)],[(6,403),(777,1412),(395,1310)])}
def fit(P,L):
    A=np.c_[np.array(P,float),np.ones(len(P))]; X,*_=np.linalg.lstsq(A,np.array(L,float),rcond=None); return X
M=json.load(open(REPO+'/data/geography/legon-master.geojson'))['features']
BL=[[local(la,lo) for lo,la in f['geometry']['coordinates'][0]] for f in M if f['properties']['layer']=='building']
def roofmask(a): r,g,b=a[...,0],a[...,1],a[...,2]; return ((r>120)&(r-g>25)&(r-b>45)).astype(float)
def osmmask(x0,z0,W,mpp=1.0):
    im=Image.new('L',(W,W),0); d=ImageDraw.Draw(im)
    for ring in BL:
        if all(abs(px-(x0+W/2*mpp))>W*mpp for px,_ in ring): continue
        d.polygon([((px-x0)/mpp,(pz-z0)/mpp) for px,pz in ring],fill=1)
    return np.asarray(im,float)
def sample(img, px, py):
    h,w,_=img.shape; ok=(px>=0)&(py>=0)&(px<w-1)&(py<h-1)
    xi=np.clip(px.astype(int),0,w-1); yi=np.clip(py.astype(int),0,h-1)
    out=img[yi,xi]; out[~ok]=0; return out, ok
def register(which, cx, cz, R=160, search=45, init=None):
    """returns pixel->local mapping (s, tx, tz) with north-up assumption: x = s*px + tx, z = s*py + tz"""
    img=IMG[which]; X=fit(*CP[which])
    # local -> pixel inverse of rough affine
    Ainv=np.linalg.inv(X[:2].T)
    def l2p(x,z): v=Ainv@(np.array([x,z])-X[2]); return v
    p0=l2p(cx,cz); s0=float(np.sqrt(abs(np.linalg.det(X[:2]))))
    if init: s0=init[0]; p0=np.array([(cx-init[1])/init[0],(cz-init[2])/init[0]])
    W=2*R; om=osmmask(cx-R,cz-R,W)
    rm_full=roofmask(img)
    xs=np.arange(W)+cx-R+0.5; zs=np.arange(W)+cz-R+0.5; XX,ZZ=np.meshgrid(xs,zs)
    best=(-1,None)
    for s in s0*(np.linspace(0.85,1.15,13) if not init else np.linspace(0.94,1.06,7)):
        for dx in range(-search,search+1,3 if search<=60 else 5):
            for dz in range(-search,search+1,3 if search<=60 else 5):
                # pixel = (local - t)/s with t chosen so that (cx+dx,cz+dz) maps to p0
                tx=cx+dx-s*p0[0]; tz=cz+dz-s*p0[1]
                px=(XX-tx)/s; py=(ZZ-tz)/s
                h,w=rm_full.shape; ok=(px>=0)&(py>=0)&(px<w-1)&(py<h-1)
                if ok.mean()<0.6: continue
                rm=rm_full[np.clip(py.astype(int),0,h-1),np.clip(px.astype(int),0,w-1)]*ok
                sc=(rm*om).sum()/np.sqrt((rm.sum()+1)*(om.sum()+1))
                if sc>best[0]: best=(sc,(s,tx,tz))
    # refine
    sc,(s,tx,tz)=best
    for s2 in s*np.linspace(0.97,1.03,7):
        for dx in np.arange(-3,3.1,1):
            for dz in np.arange(-3,3.1,1):
                px=(XX-(tx+dx))/s2; py=(ZZ-(tz+dz))/s2
                h,w=rm_full.shape; ok=(px>=0)&(py>=0)&(px<w-1)&(py<h-1)
                rm=rm_full[np.clip(py.astype(int),0,h-1),np.clip(px.astype(int),0,w-1)]*ok
                v=(rm*om).sum()/np.sqrt((rm.sum()+1)*(om.sum()+1))
                if v>best[0]: best=(v,(s2,tx+dx,tz+dz))
    return best
def warp(which, T, x0, z0, x1, z1, mpp=0.5):
    s,tx,tz=T; img=IMG[which]
    xs=np.arange(x0,x1,mpp)+mpp/2; zs=np.arange(z0,z1,mpp)+mpp/2; XX,ZZ=np.meshgrid(xs,zs)
    out,ok=sample(img,(XX-tx)/s,(ZZ-tz)/s)
    return Image.fromarray(np.clip(out,0,255).astype(np.uint8))
