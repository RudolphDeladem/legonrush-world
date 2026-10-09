import numpy as np, json
from PIL import Image, ImageDraw, ImageFilter
from collections import deque
im=np.asarray(Image.open('../images/200.webp').convert('RGB')).astype(int)
r,g,b=im[...,0],im[...,1],im[...,2]
m=(g>170)&(r<160)&(b<130)&(g-r>70)
mk=np.asarray(Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)))>0
H,W=mk.shape
wall=mk.copy(); wall[0:2,:]=True; wall[:,0:2]=True
# outside: BFS from bottom-middle
seen=np.zeros_like(wall)
def bfs(sy,sx,mask):
  q=deque([(sy,sx)]); mask[sy,sx]=True; pts=[]
  while q:
    y,x=q.popleft(); pts.append((y,x))
    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
      ny,nx=y+dy,x+dx
      if 0<=ny<H and 0<=nx<W and not mask[ny,nx] and not wall[ny,nx]:
        mask[ny,nx]=True; q.append((ny,nx))
  return pts
out=bfs(560,600,seen)
print('outside',len(out))
s,tx,tz=0.25182,74.0,-484.0
res=[]
for y in range(0,H,3):
  for x in range(0,W,3):
    if not seen[y,x] and not wall[y,x]:
      pts=bfs(y,x,seen)
      if len(pts)<300: continue
      ys=np.array([p[0] for p in pts]); xs=np.array([p[1] for p in pts])
      cells=sorted({(round((tx+xx*s)/3)*3, round((tz+yy*s)/3)*3) for yy,xx in zip(ys[::5],xs[::5])})
      print(len(pts), round(tx+xs.min()*s,1),round(tx+xs.max()*s,1),round(tz+ys.min()*s,1),round(tz+ys.max()*s,1), len(cells))
      res.append(cells)
json.dump(res,open('ia/trees.json','w'))
