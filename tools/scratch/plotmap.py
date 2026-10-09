import json,sys
from PIL import Image, ImageDraw, ImageFont
x0,x1,z0,z1,s,out=float(sys.argv[1]),float(sys.argv[2]),float(sys.argv[3]),float(sys.argv[4]),float(sys.argv[5]),sys.argv[6]
L=json.load(open('/home/user/legonrush-world/src/data/legon-map.json')); N=L['nodes']
W=int((x1-x0)*s); H=int((z1-z0)*s)
im=Image.new('RGB',(W,H),(240,238,230)); d=ImageDraw.Draw(im)
P=lambda x,z:((x-x0)*s,(z-z0)*s)
col={'parking':(200,200,215),'wood':(120,170,110),'plaza':(215,205,185),'pitch':(150,200,140),'track':(220,150,130),'water':(150,190,230),'grass':(190,225,170)}
for a in L['areas']:
  q=a['p']; pts=[P(q[i]/10,q[i+1]/10) for i in range(0,len(q),2)]
  d.polygon(pts,fill=col.get(a['k'],(230,230,200)),outline=(120,120,140))
for r in L['roads']:
  d.line([P(N[i*2]/10,N[i*2+1]/10) for i in r['w']],fill=(255,255,255) if r['c']<4 else (170,160,140),width=max(1,int([9,7,6,4.6,1.5][r['c']]*s)))
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',10)
for k,b in enumerate(L['buildings']):
  q=b['p']; pts=[P(q[i]/10,q[i+1]/10) for i in range(0,len(q),2)]
  if max(p[0] for p in pts)<0 or min(p[0] for p in pts)>W or max(p[1] for p in pts)<0 or min(p[1] for p in pts)>H: continue
  d.polygon(pts,fill=(205,190,170),outline=(90,70,50))
  cx=sum(p[0] for p in pts)/len(pts); cy=sum(p[1] for p in pts)/len(pts)
  d.text((cx-6,cy-5),str(k),fill=(200,0,0),font=F)
for g in range(int(x0//50*50),int(x1)+1,50):
  d.line([P(g,z0),P(g,z0+3)],fill=(0,0,0)); d.text((P(g,z0)[0]+2,2),str(g),fill=(0,0,0),font=F)
for g in range(int(z0//50*50),int(z1)+1,50):
  d.line([P(x0,g),P(x0+3,g)],fill=(0,0,0)); d.text((2,P(x0,g)[1]),str(g),fill=(0,0,0),font=F)
im.save(out)
