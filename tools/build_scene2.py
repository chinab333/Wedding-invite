"""Splits the Rajasthan artwork into sky / far hills / near hills / fort+town plus a window-light map and a lake mask.
Usage: python build_scene2.py <2.webp> <outdir> <debugdir>"""
import sys, numpy as np, cv2
from PIL import Image
src,out,dbg=sys.argv[1:4]
I=np.array(Image.open(src).convert('RGB'))[:,:,::-1].copy(); H,W=I.shape[:2]
hsv=cv2.cvtColor(I,cv2.COLOR_BGR2HSV); L=cv2.cvtColor(I,cv2.COLOR_BGR2GRAY)
OUT=1920; SC=OUT/W
def poly(pts,h=H,w=W):
    m=np.zeros((h,w),np.uint8); cv2.fillPoly(m,[np.array(pts,np.int32)],255); return m
def gc(prob,sure,sure_bg=None,iters=5):
    m=np.full((H,W),cv2.GC_PR_BGD,np.uint8)
    m[prob>0]=cv2.GC_PR_FGD; m[sure>0]=cv2.GC_FGD
    if sure_bg is not None: m[sure_bg>0]=cv2.GC_BGD
    b,f=np.zeros((1,65)),np.zeros((1,65)); cv2.grabCut(I,m,None,b,f,iters,cv2.GC_INIT_WITH_MASK)
    return np.where((m==1)|(m==3),255,0).astype(np.uint8)

# sky: traced far ridge, refined per column against the warm sky colour
warm=(I[...,2].astype(int)-I[...,0].astype(int)>26)
tr=np.array([(0,300),(100,288),(200,305),(270,302),(320,305),(400,303),(480,285),(560,295),(620,305),(700,300),(800,298),(900,292),(1000,280),(1130,285),(1300,288),(1350,270),(1430,225),(1480,205),(1536,225)],float)
trace=np.interp(np.arange(W),tr[:,0],tr[:,1])
ridge=np.zeros(W,np.float32)
for x in range(W):
    y=int(trace[x])-22
    while y<int(trace[x])+30 and warm[y:y+3,x].all(): y+=1
    ridge[x]=y
ridge=cv2.GaussianBlur(cv2.medianBlur(ridge[None],5),(0,0),sigmaX=.8)[0].astype(int)
land=np.zeros((H,W),np.uint8)
for x in range(W): land[ridge[x]:,x]=255

# sky plate: land removed, birds removed, sky carried down past the ridge
birds=np.zeros((H,W),np.uint8); birds[205:250,1100:1215]=(L[205:250,1100:1215]<95)*255
birds=cv2.dilate(birds,np.ones((7,7),np.uint8))
sky=cv2.inpaint(I,birds,5,cv2.INPAINT_TELEA)
hole=cv2.dilate(land,np.ones((9,9),np.uint8))
S_H=640
sky=sky[:S_H].astype(np.float32); hole=hole[:S_H]
# sky below the ridge: the horizon colour, sun excluded, smoothed sideways
band=np.zeros((W,3),np.float32); bm=np.zeros(W,np.float32)
for x in range(W):
    y0=max(np.where(hole[:,x]>0)[0][0],8)
    band[x]=sky[max(y0-26,0):y0-4,x].mean(axis=0); bm[x]=0 if 300<x<400 else 1
band=(cv2.GaussianBlur((band*bm[:,None])[None],(0,0),sigmaX=45)/np.maximum(cv2.GaussianBlur(bm[None],(0,0),sigmaX=45)[...,None],1e-3))[0]
ha=cv2.GaussianBlur(hole,(0,0),2)[...,None].astype(np.float32)/255.
sky=sky*(1-ha)+np.repeat(band[None],S_H,axis=0)*ha

# front: fort + town + trees, everything nearer than the lake
front_prob=poly([(0,800),(90,790),(150,780),(230,745),(350,690),(470,690),(560,690),(640,640),(690,610),(760,550),(840,540),(870,470),(1000,470),(1090,440),(1110,385),(1210,375),(1310,360),(1350,330),(1440,320),(1536,300),(1536,1024),(0,1024)])
front_sure=poly([(0,860),(240,790),(380,740),(690,690),(710,640),(900,620),(900,500),(1000,510),(1120,420),(1340,380),(1536,380),(1536,1024),(0,1024)])
lake_bg=poly([(0,600),(690,600),(660,650),(560,680),(340,690),(230,730),(120,770),(0,790)])
front=gc(front_prob,front_sure,lake_bg)
# nothing above the traced silhouette may leak in
front[cv2.dilate(front_prob,np.ones((21,21),np.uint8))==0]=0
c,lab,st,_=cv2.connectedComponentsWithStats(front); front=np.where(lab==(1+np.argmax(st[1:,cv2.CC_STAT_AREA])),255,0).astype(np.uint8)
front=cv2.morphologyEx(front,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
front_a=cv2.GaussianBlur(front,(0,0),1.0)

# near hills: the dark green ranges in front of the blue distance
near_prob=poly([(0,318),(60,338),(130,362),(200,352),(300,318),(400,303),(480,285),(540,292),(610,322),(700,378),(800,410),(900,445),(1000,478),(1100,470),(1100,560),(1200,420),(1300,345),(1430,240),(1470,205),(1536,225),(1536,620),(0,620)])
near_sure=poly([(0,372),(120,392),(250,372),(400,335),(490,322),(560,350),(700,420),(860,470),(1000,510),(1100,500),(1220,440),(1330,370),(1460,250),(1536,260),(1536,620),(0,620)])
far_bg=poly([(0,250),(1536,180),(1536,200),(1430,190),(1250,330),(1090,420),(1000,420),(780,360),(600,296),(490,270),(300,285),(120,330),(0,290)])
near=gc(near_prob,near_sure,far_bg,4)
near[:,:]=np.where(land>0,near,0)
near=cv2.morphologyEx(near,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
near_a=cv2.GaussianBlur(near,(0,0),1.1)

# far layer: distant blue ridges carried straight down behind the near hills
hide=cv2.bitwise_or(cv2.dilate(near,np.ones((7,7),np.uint8)),cv2.dilate(front,np.ones((9,9),np.uint8)))
far_rgb=I.astype(np.float32).copy(); fb=np.zeros((W,3),np.float32)
for x in range(W):
    ys=np.where(hide[:,x]>0)[0]; y0=ys[0] if len(ys) else H-1; y1=max(y0-3,ridge[x]+1)
    fb[x]=I[max(y1-12,0):y1+1,x].mean(axis=0); far_rgb[y0:,x]=fb[x]
far_rgb=far_rgb.astype(np.uint8)
far_a=cv2.GaussianBlur(land,(0,0),.9)
# near layer: opaque from the shoreline down; behind the fort the lake and shore run on to the right
near[560:]=255
near_a=cv2.GaussianBlur(near,(0,0),1.1)
hide2=cv2.dilate(front,np.ones((11,11),np.uint8))
near_rgb=I.astype(np.float32).copy()
# rows behind the fort take the row's own median colour from the open left side: lake stays lake, shore stays shore
rowcol=np.array([np.median(I[min(y,785),0:540].reshape(-1,3),axis=0) for y in range(H)],np.float32)
rowcol=cv2.GaussianBlur(rowcol[:,None,:],(1,0),sigmaX=.01,sigmaY=2.5)[:,0]
tex=(I.astype(np.float32)-cv2.GaussianBlur(I.astype(np.float32),(0,0),6))
fill=np.repeat(rowcol[:,None,:],W,axis=1)
near_rgb=np.where(hide2[...,None]>0,fill,near_rgb)
ha2=cv2.GaussianBlur(hide2,(0,0),3)[...,None].astype(np.float32)/255.
near_rgb=(I*(1-ha2)+near_rgb*ha2).astype(np.uint8)
# no far ridge where the near hills already reach the skyline
warm_col=(fb[:,2]-fb[:,0]>18).astype(np.float32)
cut=cv2.GaussianBlur(1-warm_col[None],(0,0),sigmaX=6)[0]
far_a=(far_a.astype(np.float32)*cut[None,:]).astype(np.uint8)

# lake mask (for ripples) — baked in the far/near plane
water=np.zeros((H,W),np.float32)
lake=poly([(0,585),(300,580),(690,600),(700,640),(600,665),(555,685),(340,690),(230,735),(120,778),(0,792)])
water=cv2.GaussianBlur(lake,(0,0),4).astype(np.float32)/255.
# the lake layer must stay opaque behind the front, and the far layer covers it
# window lights: bright warm blobs on the fort, town and promenade
v=hsv[...,2].astype(np.float32); s_=hsv[...,1].astype(np.float32); h_=hsv[...,0].astype(np.float32)
glow=((h_>14)&(h_<30)&(v>232)&(s_>125)&(land>0)).astype(np.uint8)*255
glow[poly([(0,598),(700,598),(700,650),(560,690),(230,740),(0,800)])>0]=0
glow=cv2.morphologyEx(glow,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
c,lab,st,cen=cv2.connectedComponentsWithStats(glow)
rng=np.random.default_rng(3); T=np.zeros((H,W),np.float32); M=np.zeros((H,W),np.float32); n=0
order=[]
for i in range(1,c):
    if st[i,cv2.CC_STAT_AREA]<4 or st[i,cv2.CC_STAT_AREA]>420: continue
    # lights climb the hillside: lowest first, then upward, with a little randomness
    x,y=cen[i]; t=np.clip(.92-(y/1024)*.72+rng.uniform(-.12,.12),.04,.96)
    reg=(lab==i).astype(np.uint8); reg=cv2.dilate(reg,np.ones((9,9),np.uint8))
    T[reg>0]=t; M[lab==i]=1; n+=1
M=cv2.GaussianBlur(cv2.dilate(M,np.ones((3,3),np.uint8)),(0,0),1.6)
print('lights',n)
lights=np.dstack([M*255,T*255,np.zeros((H,W))]).astype(np.uint8)
Image.fromarray(lights).save(f'{out}/fort-lights.webp',lossless=True,method=6)
Image.fromarray((water*255).astype(np.uint8)).resize((W//4,H//4)).save(f'{out}/fort-water.webp',quality=70)

def rgba(rgb,a): return np.dstack([rgb[...,2],rgb[...,1],rgb[...,0],a])
def save(arr,name,q=84,size=None):
    im=Image.fromarray(arr.astype(np.uint8))
    im=im.resize((round(im.width*SC),round(im.height*SC)),Image.LANCZOS)
    im.save(f'{out}/{name}.webp',quality=q,method=6,alpha_quality=90); print(name,im.size)
save(sky[...,::-1].clip(0,255),'fort-sky',q=80)
save(rgba(far_rgb,far_a)[150:700],'fort-far',q=80)       # y offset 150
save(rgba(near_rgb,near_a)[190:],'fort-near',q=80)        # y offset 190
save(I[...,::-1],'fort-still',q=78)
save(rgba(I,front_a)[290:],'fort-front',q=84)            # y offset 290

comp=np.zeros((H,W,3),np.float32); comp[:S_H]=sky; comp[S_H:]=I[S_H:]
def over(c,rgb,a): a=a[...,None]/255.; return c*(1-a)+rgb*a
c2=np.zeros((H,W,3),np.uint8); c2[:]=(190,60,190)
Image.fromarray(over(c2,I,front_a).astype(np.uint8)[...,::-1]).resize((W//2,H//2)).save(dbg+'/s2_front.png')
Image.fromarray(over(c2,near_rgb,near_a).astype(np.uint8)[...,::-1]).resize((W//2,H//2)).save(dbg+'/s2_near.png')
Image.fromarray(over(c2,far_rgb,far_a).astype(np.uint8)[...,::-1]).resize((W//2,H//2)).save(dbg+'/s2_far.png')
Image.fromarray(sky.clip(0,255).astype(np.uint8)[...,::-1]).resize((W//2,S_H//2)).save(dbg+'/s2_sky.png')
Image.fromarray(lights).resize((W//2,H//2)).save(dbg+'/s2_lights.png')
