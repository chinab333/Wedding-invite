"""Bakes finale, dusk and texture plates and converts rendered art to webp.
Usage: bake_plates.py <project> <png_dir> <source2.webp>"""
import sys,numpy as np,cv2
from PIL import Image
P,PNG,SRC2=sys.argv[1:4]; SC=P+'/assets/scene'; ART=P+'/assets/art'
def rgba(n): return np.array(Image.open(f'{SC}/{n}.webp').convert('RGBA')).astype(np.float32)
def over(b,l,x=0,y=0,s=1.):
    if s!=1: l=cv2.resize(l,None,fx=s,fy=s,interpolation=cv2.INTER_AREA)
    h,w=l.shape[:2]; x0,y0=max(x,0),max(y,0); x1,y1=min(x+w,b.shape[1]),min(y+h,b.shape[0])
    if x1<=x0 or y1<=y0: return b
    a=l[y0-y:y1-y,x0-x:x1-x,3:4]/255.; b[y0:y1,x0:x1]=b[y0:y1,x0:x1]*(1-a)+l[y0-y:y1-y,x0-x:x1-x,:3]*a; return b
def save(a,p,q=80):
    Image.fromarray(np.clip(a,0,255).astype(np.uint8)).save(p+'.webp',quality=q,method=6)
plate=rgba('lake-plate')[...,:3]; couple=rgba('lake-couple'); statue=rgba('lake-statue')
H,W=plate.shape[:2]
# ---- portrait recomposition of the opening: statue brought in, couple re-seated, sun kept ---
def portrait(pl):
    X0,X1=900,1640
    c=pl[:,X0:X1].copy()
    c=over(c,statue,588+262-X0,380)
    cs=.86; ch=int(couple.shape[0]*cs)
    lay=cv2.resize(couple,None,fx=cs,fy=cs,interpolation=cv2.INTER_AREA)
    cx=int((588+505)*cs)  # couple centre in scaled layer
    return over(c,lay,(X1-X0)//2-cx+18,H-ch)
save(portrait(plate),f'{SC}/lake-still-portrait',q=76)
# ---- finale: the same lake after the sun has gone ----
def dusk(a,sky_tint=(.34,.40,.62),water=(.30,.40,.60)):
    a=a/255.; L=a.mean(axis=2,keepdims=True)
    h=a.shape[0]; hz=757/1451
    t=np.ones((h,1,3),np.float32)*np.array(sky_tint,np.float32)
    b=(L**1.15)*np.array([.56,.66,1.0],np.float32)*.8+a*np.array([.34,.26,.2],np.float32)
    # ember low in the west, near the horizon
    yy=np.arange(h)[:,None]/h; ember=np.exp(-((yy-hz)/.07)**2)[...,None]*np.array([.46,.2,.1],np.float32)
    return np.clip(b+ember*(.5+L),0,1)*255
fin=dusk(plate)
rng=np.random.default_rng(5)
for _ in range(240):
    x,y=rng.integers(0,W),rng.integers(0,520); r=rng.uniform(.5,1.5); v=rng.uniform(120,240)
    cv2.circle(fin,(int(x),int(y)),int(r+.5),(v,v,v*.92),-1,cv2.LINE_AA)
def dark_layer(l,k=.42,tint=(.72,.8,1.05)):
    o=l.copy(); o[...,:3]=l[...,:3]*k*np.array(tint,np.float32); return o
Image.fromarray(np.clip(fin,0,255).astype(np.uint8)).save(f'{SC}/lake-dusk.webp',quality=74,method=6)
Image.fromarray(np.clip(dark_layer(couple,.62),0,255).astype(np.uint8),'RGBA').save(f'{SC}/couple-dusk.webp',quality=84,method=6,alpha_quality=88)
Image.fromarray(np.clip(dark_layer(statue,.36),0,255).astype(np.uint8),'RGBA').resize((statue.shape[1],statue.shape[0])).save(f'{SC}/statue-dusk.webp',quality=80,method=6)
# ---- the fort at nightfall, its windows lit: the family scene's horizon ----
front=np.array(Image.open(f'{SC}/fort-front.webp').convert('RGBA')).astype(np.float32)
li=np.array(Image.open(f'{SC}/fort-lights.webp').convert('RGB')).astype(np.float32)[290:,:,0]/255.
li=cv2.resize(li,(front.shape[1],front.shape[0]))
night=front.copy(); night[...,:3]=front[...,:3]*np.array([.30,.33,.55],np.float32)
gl=cv2.GaussianBlur(li,(0,0),9)[...,None]
night[...,:3]=night[...,:3]*(1-li[...,None])+front[...,:3]*li[...,None]*1.12+gl*np.array([120,70,20],np.float32)
Image.fromarray(np.clip(night,0,255).astype(np.uint8),'RGBA').save(f'{SC}/fort-night.webp',quality=78,method=6,alpha_quality=85)
# ---- tile-able hand-made paper ----
n=512; rng=np.random.default_rng(1)
def periodic(power):
    f=np.fft.fft2(rng.standard_normal((n,n))); fy=np.fft.fftfreq(n)[:,None]; fx=np.fft.fftfreq(n)[None,:]; r=np.sqrt(fx**2+fy**2); r[0,0]=1
    o=np.real(np.fft.ifft2(f/r**power)); return (o-o.mean())/o.std()
tex=periodic(1.3)*.022+periodic(.35)*.016
paper=np.clip(.95+tex,0,1)*255
Image.fromarray(paper.astype(np.uint8)).convert('RGB').save(f'{ART}/paper.webp',quality=70,method=6)
# ---- rendered art ----
for n,w in [('m1',760),('m2',760),('m3',760),('m4',760),('m5',760),('m6',760),('m7',760),('m8',760),('jharokha',760),('window',160),('jb-sky',1800),('jb-gorge',1800),('jb-river',2000)]:
    im=Image.open(f'{PNG}/{n}.png').convert('RGBA'); h=round(im.height*w/im.width); im=im.resize((w,h),Image.LANCZOS)
    im.save(f'{ART}/{n}.webp',quality=72 if n.startswith('jb') else 76,method=6,alpha_quality=88)
