import sys, json
exec(open('/tmp/claude-0/-home-user-legonrush-world/afde20e7-2667-59fa-8c1a-7cae30d15f52/scratchpad/vrender.py').read().split("if __name__")[0])
R=json.load(open('/tmp/claude-0/-home-user-legonrush-world/afde20e7-2667-59fa-8c1a-7cae30d15f52/scratchpad/routes_v3.json'))
out,idx,which,cx,cz,Rad=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),float(sys.argv[4]),float(sys.argv[5]),float(sys.argv[6])
r=R[idx]
render(out, r['to'], which, cx, cz, Rad, mpp=Rad/250)
im=Image.open(out).convert('RGBA'); ov=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
mpp=Rad/250; P=lambda x,z: ((x-(cx-Rad))/mpp,(z-(cz-Rad))/mpp)
lead=r['lead']; full=r['full']; k=int(lead/2)
d.line([P(*p) for p in full[:k+1]],fill=(255,255,255,255),width=3)
d.line([P(*p) for p in full[k:]],fill=(255,80,140,255),width=4)
for p,lab,c in ((r['start'],'START',(255,255,255,255)),(r['finish'],'ARRIVAL',(0,255,80,255)),(r['end'],'RIDER STOPS',(255,220,0,255))):
    X,Y=P(*p); d.ellipse([X-6,Y-6,X+6,Y+6],outline=c,width=3); d.text((X+8,Y+2),lab,fill=c,font=F,stroke_width=2,stroke_fill=(0,0,0,255))
d.text((4,4),f"{r['from']} -> {r['to']} {r['len']} m",fill=(255,255,255,255),font=F,stroke_width=2,stroke_fill=(0,0,0,255))
Image.alpha_composite(im,ov).convert('RGB').save(out)
