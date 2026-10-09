import sys, json
sys.path.insert(0, '/tmp/claude-0/-home-user-legonrush-world/afde20e7-2667-59fa-8c1a-7cae30d15f52/scratchpad')
exec(open('/tmp/claude-0/-home-user-legonrush-world/afde20e7-2667-59fa-8c1a-7cae30d15f52/scratchpad/reg.py').read())
from PIL import ImageFont
T={1:(0.96,-390.5,442.4),2:(1.91,-1077,-1512)}
L=json.load(open(REPO+'/src/data/legon-map.json'))
A={f['properties']['place']:f for f in json.load(open(REPO+'/data/geography/legon-access.geojson'))['features'] if f['properties']['role']=='entrance'}
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',11)
def render(out, name, which, cx, cz, R=110, mpp=0.5, marks=(), grid=10, outlines=True):
    sc,Tr=register(which,cx,cz,R=150,search=60,init=T[which])
    if sc<0.3: Tr=T[which]
    im=warp(which,Tr,cx-R,cz-R,cx+R,cz+R,mpp).convert('RGBA')
    ov=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
    P=lambda x,z: ((x-(cx-R))/mpp,(z-(cz-R))/mpp)
    g=int((cx-R)//grid*grid)
    while g<cx+R:
        X=P(g,0)[0]; d.line([(X,0),(X,im.height)],fill=(255,255,0,40 if g%50 else 110))
        if g%50==0: d.text((X+2,2),str(g),fill=(255,255,0,255),font=F,stroke_width=2,stroke_fill=(0,0,0,255))
        g+=grid
    g=int((cz-R)//grid*grid)
    while g<cz+R:
        Y=P(0,g)[1]; d.line([(0,Y),(im.width,Y)],fill=(255,255,0,40 if g%50 else 110))
        if g%50==0: d.text((2,Y+2),str(g),fill=(255,255,0,255),font=F,stroke_width=2,stroke_fill=(0,0,0,255))
        g+=grid
    N=L['nodes']
    if outlines:
        for b in L['buildings']:
            q=b['p']; d.polygon([P(q[i]/10,q[i+1]/10) for i in range(0,len(q),2)],outline=(255,60,60,200))
        for r in L['roads']:
            d.line([P(N[i*2]/10,N[i*2+1]/10) for i in r['w']],fill=(255,255,255,150) if r['c']<4 else (0,230,255,180),width=1)
    a=A.get(name)
    if a:
        e=local(*a['geometry']['coordinates'][::-1]); ar=local(*a['properties']['arrival'][::-1])
        d.line([P(*ar),P(*e)],fill=(255,0,255,255),width=2)
        for p,c in ((e,(255,0,255,255)),(ar,(0,255,0,255))):
            X,Y=P(*p); d.ellipse([X-4,Y-4,X+4,Y+4],fill=c,outline=(0,0,0,255))
    for (x,z,lab,col) in marks:
        X,Y=P(x,z); d.ellipse([X-5,Y-5,X+5,Y+5],outline=col,width=2); d.text((X+7,Y-6),lab,fill=col,font=F,stroke_width=2,stroke_fill=(0,0,0,255))
    d.text((4,im.height-16),f"{name}  atlas{which} reg={sc:.2f}  now: {a['properties']['method'] if a else '-'} {a['properties']['confidence'] if a else ''}",fill=(255,255,255,255),font=F,stroke_width=2,stroke_fill=(0,0,0,255))
    Image.alpha_composite(im,ov).convert('RGB').save(out)
if __name__=='__main__':
    for spec in sys.argv[1:]:
        out,name,which,cx,cz,R=spec.split('|'); render(out,name,int(which),float(cx),float(cz),float(R))
