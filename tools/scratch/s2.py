import rasterio, numpy as np, sys, os
from rasterio.windows import from_bounds
from pyproj import Transformer
from PIL import Image
os.environ['CURL_CA_BUNDLE']='/root/.ccr/ca-bundle.crt'
os.environ['GDAL_DISABLE_READDIR_ON_OPEN']='EMPTY_DIR'
D=sys.argv[0].rsplit('/',1)[0]
W,S_,E,N=-0.2085,5.6220,-0.1650,5.6710
tr=Transformer.from_crs(4326,32630,always_xy=True)
xs,ys=zip(*[tr.transform(x,y) for x in (W,E) for y in (S_,N)])
bx=(min(xs),min(ys),max(xs),max(ys))
stack=[];names=[]
for line in open(D+'/s2cc.txt'):
    p=line.split()[0]; sid=p.rstrip('/').split('/')[-1]
    url=f'/vsicurl/https://sentinel-cogs.s3.us-west-2.amazonaws.com/{p}TCI.tif'
    try:
        with rasterio.open(url) as r:
            w=from_bounds(*bx,transform=r.transform).round_offsets().round_lengths()
            a=r.read(window=w)
            if not stack: tf=r.window_transform(w); crs=r.crs
    except Exception as e: print('fail',sid,e); continue
    if a.shape!=(3,)+ (stack[0].shape[1:] if stack else a.shape[1:]): continue
    if (a==0).mean()>0.05: print('nodata',sid); continue
    bright=(a.min(0)>170).mean()
    print(sid, 'cloudfrac %.3f'%bright, flush=True)
    if bright<0.02: stack.append(a); names.append(sid)
print('clear scenes',len(stack),names)
m=np.median(np.stack(stack),axis=0).astype(np.uint8)
np.save(D+'/s2_median.npy',m)
with rasterio.open(D+'/src/s2_legon_utm30.tif','w',driver='GTiff',height=m.shape[1],width=m.shape[2],count=3,dtype='uint8',crs=crs,transform=tf) as o: o.write(m)
Image.fromarray(np.transpose(m,(1,2,0))).save(D+'/s2_preview.png')
open(D+'/s2_used.txt','w').write('\n'.join(names))
