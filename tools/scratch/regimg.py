# georeference a north-up reference image (the user's labelled layouts) by matching roofs to OSM footprints
import sys, json, numpy as np
sys.path.insert(0,'/tmp/claude-0/-home-user-legonrush-world/afde20e7-2667-59fa-8c1a-7cae30d15f52/scratchpad')
exec(open('/tmp/claude-0/-home-user-legonrush-world/afde20e7-2667-59fa-8c1a-7cae30d15f52/scratchpad/reg.py').read())
def regimg(path, cx, cz, smin=0.2, smax=1.4, R=None, mask_label=True):
    img=np.asarray(Image.open(path).convert('RGB')).astype(float)
    h,w,_=img.shape
    rm=roofmask(img)
    if mask_label: rm[:70,:]=0  # the black title banner
    best=(-1,None)
    for s in np.geomspace(smin,smax,40):
        Wm=int(max(w,h)*s/2)+60
        om=osmmask(cx-Wm,cz-Wm,2*Wm)
        # downsample image mask to local 1 m grid at this scale: pixel (u,v) -> local x = tx + s*u
        # search tx,tz so that image centre lands within +-(Wm) of (cx,cz)
        us=np.arange(0,w,max(1,int(1/s))); vs=np.arange(0,h,max(1,int(1/s)))
        UU,VV=np.meshgrid(us,vs); m=rm[VV,UU]; sel=m>0
        if sel.sum()<50: continue
        U=UU[sel]*s; V=VV[sel]*s
        step=4
        for tx in np.arange(cx-Wm, cx+Wm-w*s+1, step):
            for tz in np.arange(cz-Wm, cz+Wm-h*s+1, step):
                xi=(U+tx-(cx-Wm)).astype(int); zi=(V+tz-(cz-Wm)).astype(int)
                ok=(xi>=0)&(zi>=0)&(xi<2*Wm)&(zi<2*Wm)
                hit=om[zi[ok],xi[ok]].sum()
                # normalise by roof pixels and osm area in the image footprint
                osmin=om[int(max(0,tz-(cz-Wm))):int(max(0,tz-(cz-Wm)+h*s)),int(max(0,tx-(cx-Wm))):int(max(0,tx-(cx-Wm)+w*s))].sum()
                sc=hit/np.sqrt((len(U))*(osmin+1))
                if sc>best[0]: best=(sc,(s,tx,tz))
    sc,(s,tx,tz)=best
    # refine
    for s2 in s*np.linspace(0.96,1.04,9):
        us=np.arange(0,w,max(1,int(0.5/s2))); vs=np.arange(0,h,max(1,int(0.5/s2)))
        UU,VV=np.meshgrid(us,vs); m=rm[VV,UU]; sel=m>0; U=UU[sel]*s2; V=VV[sel]*s2
        Wm=int(max(w,h)*s2/2)+60; om=osmmask(cx-Wm,cz-Wm,2*Wm)
        for dx in np.arange(-5,5.1,1):
            for dz in np.arange(-5,5.1,1):
                xi=(U+tx+dx-(cx-Wm)).astype(int); zi=(V+tz+dz-(cz-Wm)).astype(int)
                ok=(xi>=0)&(zi>=0)&(xi<2*Wm)&(zi<2*Wm)
                osmin=om[int(max(0,tz+dz-(cz-Wm))):int(max(0,tz+dz-(cz-Wm)+h*s2)),int(max(0,tx+dx-(cx-Wm))):int(max(0,tx+dx-(cx-Wm)+w*s2))].sum()
                v=om[zi[ok],xi[ok]].sum()/np.sqrt(len(U)*(osmin+1))
                if v>best[0]: best=(v,(s2,tx+dx,tz+dz))
    return best
def overlay(path, T, out, extra=()):
    s,tx,tz=T
    im=Image.open(path).convert('RGBA'); d=ImageDraw.Draw(im)
    P=lambda x,z: ((x-tx)/s,(z-tz)/s)
    L=json.load(open(REPO+'/src/data/legon-map.json')); N=L['nodes']
    for b in L['buildings']:
        q=b['p']; d.polygon([P(q[i]/10,q[i+1]/10) for i in range(0,len(q),2)],outline=(255,40,40,255))
    for r in L['roads']:
        d.line([P(N[i*2]/10,N[i*2+1]/10) for i in r['w']],fill=(255,255,255,230) if r['c']<4 else (0,230,255,255),width=2)
    from PIL import ImageFont
    F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',11)
    # 10 m grid ticks
    w,h=im.size
    for g in range(int(tx//10*10), int(tx+w*s)+10, 10):
        X=(g-tx)/s; d.line([(X,h-8),(X,h)],fill=(255,255,0,255)); 
        if g%50==0: d.text((X+1,h-22),str(g),fill=(255,255,0,255),font=F,stroke_width=2,stroke_fill=(0,0,0,255))
    for g in range(int(tz//10*10), int(tz+h*s)+10, 10):
        Y=(g-tz)/s; d.line([(0,Y),(8,Y)],fill=(255,255,0,255))
        if g%50==0: d.text((10,Y-6),str(g),fill=(255,255,0,255),font=F,stroke_width=2,stroke_fill=(0,0,0,255))
    for x,z,lab,col in extra:
        X,Y=P(x,z); d.ellipse([X-6,Y-6,X+6,Y+6],outline=col,width=3); d.text((X+8,Y-6),lab,fill=col,font=F,stroke_width=2,stroke_fill=(0,0,0,255))
    im.convert('RGB').save(out)
