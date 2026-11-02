"""Splits the opening artwork into depth layers: water+sky plate, statue, couple+railing.
Usage: python build_scene1.py <1.webp> <outdir> <debugdir>"""
import sys, numpy as np, cv2
from PIL import Image
src, out, dbg = sys.argv[1:4]
I = np.array(Image.open(src).convert('RGB'))[:, :, ::-1].copy()  # BGR
H, W = I.shape[:2]
L = cv2.cvtColor(I, cv2.COLOR_BGR2GRAY).astype(np.float32)

def poly(pts):
    m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, [np.array(pts, np.int32)], 255); return m

def grabcut(prob_fg, sure_fg=None, iters=6, pad=30):
    mask = np.full((H, W), cv2.GC_BGD, np.uint8)
    wide = cv2.dilate(prob_fg, np.ones((pad, pad), np.uint8))
    mask[wide > 0] = cv2.GC_PR_BGD
    mask[prob_fg > 0] = cv2.GC_PR_FGD
    if sure_fg is not None: mask[sure_fg > 0] = cv2.GC_FGD
    b, f = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(I, mask, None, b, f, iters, cv2.GC_INIT_WITH_MASK)
    return np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)

def keep_large(m, n=1):
    c, lab, st, _ = cv2.connectedComponentsWithStats(m)
    idx = np.argsort(-st[1:, cv2.CC_STAT_AREA])[:n] + 1
    return np.where(np.isin(lab, idx), 255, 0).astype(np.uint8)

# --- couple ---
couple_poly = poly([(462,838),(560,828),(572,768),(695,768),(702,872),(775,900),(822,1100),(815,1290),(775,1325),(780,1450),(190,1450),(285,1250),(395,960)])
couple_core = poly([(490,870),(560,880),(590,800),(670,800),(690,900),(760,950),(790,1250),(740,1320),(740,1440),(260,1440),(330,1230),(430,1000)])
couple = keep_large(grabcut(couple_poly, couple_core))
couple = cv2.morphologyEx(couple, cv2.MORPH_CLOSE, np.ones((5,5),np.uint8))
R_,B_ = I[...,2].astype(np.float32), I[...,0].astype(np.float32)
sliver = (L>70)&(B_>R_*.8); box=np.zeros((H,W),bool); box[820:990,540:640]=True
couple[sliver&box]=0

# --- railing: dark iron against bright water ---
sky_guard = np.zeros((H,W),np.uint8); sky_guard[1032:,:]=255
rail_alpha = np.clip((92 - L) / 34, 0, 1) * (sky_guard/255.)
rail_bin = (rail_alpha > .35).astype(np.uint8)*255
rail_bin[couple>0]=0
c,lab,st,_ = cv2.connectedComponentsWithStats(rail_bin)
big = [i for i in range(1,c) if st[i,cv2.CC_STAT_AREA]>900]
rail_keep = np.isin(lab,big).astype(np.uint8)*255
rail_keep = cv2.dilate(rail_keep,np.ones((5,5),np.uint8))
rail_alpha = rail_alpha*(rail_keep/255.)
# rocks in lower-left corner
rocks = poly([(0,1395),(60,1400),(110,1420),(150,1450),(0,1450)])
rock_a = cv2.GaussianBlur(rocks,(0,0),1.2)/255.

fg_a = np.maximum.reduce([cv2.GaussianBlur(couple,(0,0),.9)/255., rail_alpha, rock_a])

# --- statue with base, pier and reflection ---
st_poly = poly([(120,395),(225,390),(280,560),(285,690),(320,850),(82,858),(80,830),(0,822),(0,855),(95,860),(90,700),(125,690),(125,540)])
st_core = poly([(160,430),(200,430),(235,560),(225,680),(280,840),(100,840),(110,700),(150,680),(150,540)])
statue = keep_large(grabcut(st_poly, st_core, pad=18))
pier = poly([(0,825),(92,822),(92,856),(0,856)])
upper=np.zeros((H,W),bool); upper[:692,:]=True
statue[upper&(L>125)]=0
statue=cv2.morphologyEx(statue,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
statue = cv2.bitwise_or(statue,pier)
statue_a = cv2.GaussianBlur(statue,(0,0),.9)/255.
# reflection: painted water column below the base, feathered out
refl = np.zeros((H,W),np.float32); cv2.fillPoly(refl,[np.array([(92,850),(305,850),(290,1035),(105,1035)],np.int32)],1)
refl = cv2.GaussianBlur(refl,(0,0),14)*.92
statue_full = np.maximum(statue_a,refl)

# --- plate: remove everything, keep water/sky texture ---
rng=np.random.default_rng(7)
HORIZON=757
def row_low(img,mask):
    """Per-row interpolation across the hole, then softened: keeps the lake's horizontal colour bands."""
    o=img.astype(np.float32).copy(); known=mask==0
    for y in np.where(mask.any(axis=1))[0]:
        xs=np.where(known[y])[0]
        if len(xs)<2: continue
        for c in range(3):
            sm=np.convolve(o[y,:,c]*known[y],np.ones(61),'same')/np.maximum(np.convolve(known[y].astype(np.float32),np.ones(61),'same'),1)
            o[y,~known[y],c]=np.interp(np.where(~known[y])[0],xs,sm[xs])
    lo=cv2.GaussianBlur(o,(0,0),sigmaX=9,sigmaY=5)
    o[~known]=lo[~known]; return o

# clean water sample above the railing, used as wave texture
patch=I[872:1030,826:1076].astype(np.float32)
patch_hf=patch-cv2.GaussianBlur(patch,(0,0),7)
def water_hf(y0,y1,w):
    """Wave detail for rows y0..y1: same sample scaled up as water nears the viewer, rows slid sideways so it never tiles."""
    out=np.zeros((y1-y0,w,3),np.float32); y=y0; ph,pw=patch_hf.shape[:2]
    while y<y1:
        sc=1+max(0,(y-860))/230.           # waves grow toward the viewer
        band=int(rng.integers(26,44)); h=min(band,y1-y)
        src_h=max(2,int(h/sc)); sy=int(rng.integers(0,ph-src_h))
        row=cv2.resize(patch_hf[sy:sy+src_h],(int(pw*sc),h),interpolation=cv2.INTER_CUBIC)
        reps=np.concatenate([row,row[:,::-1]],axis=1)
        reps=np.tile(reps,(1,w//reps.shape[1]+2,1))
        off=int(rng.integers(0,row.shape[1])); out[y-y0:y-y0+h]=reps[:,off:off+w]
        y+=h
    return cv2.GaussianBlur(out,(0,0),.6)

# holes: everything standing in the water
couple_big=cv2.dilate(couple,np.ones((17,17),np.uint8))
statue_water=poly([(0,757),(340,757),(345,1045),(60,1045),(0,870)])
water_hole=cv2.bitwise_or(couple_big,statue_water); water_hole[:HORIZON+6,:]=0
sky_hole=poly([(105,380),(240,380),(295,560),(300,700),(340,770),(0,770),(0,812),(70,812),(80,700),(110,560)])
keep_row=np.ones((H,W),np.uint8)
lowrail=np.zeros((H,W),np.uint8); lowrail[1022:,:]=255   # whole lower lake is rebuilt: bars and sari sit there
hole=cv2.bitwise_or(water_hole,lowrail)
hole[:HORIZON+6,:]=0
lake=row_low(I,hole)
# below the rail there is no clean row data: extend colour bands downward from the last clean rows
ref=cv2.GaussianBlur(row_low(I,cv2.bitwise_or(couple_big,statue_water)).astype(np.float32),(0,0),sigmaX=26,sigmaY=3)
base=ref[1018].copy(); top=ref[1018]
for y in range(1022,H):
    t=(y-1022)/(H-1022)
    # the reflection path widens and the near water turns slate as in the artwork
    lake[y]=top*(1-t*.22)+np.array([150,128,108],np.float32)*(t*.22)
tex=np.zeros_like(lake); tex[HORIZON:]=water_hf(HORIZON,H,W)
amask=cv2.GaussianBlur(hole,(0,0),3).astype(np.float32)[...,None]/255.
lake=lake+tex*.8*amask
plate=np.clip(I*(1-amask)+lake*amask,0,255).astype(np.uint8)
# sky and far shore behind the statue: same row-wise repair, so clouds and the shoreline carry across
sky_hole=poly([(108,378),(236,378),(292,540),(322,690),(340,764),(0,764),(0,800),(0,764),(72,764),(78,690),(112,540)])
filled=row_low(plate,sky_hole)
hf=I.astype(np.float32)-cv2.GaussianBlur(I.astype(np.float32),(0,0),3)
filled=filled+np.roll(hf,-300,axis=1)*.7          # paint grain from the neighbouring sky
a=cv2.GaussianBlur(sky_hole,(0,0),2.5)[...,None].astype(np.float32)/255.
plate=np.clip(plate*(1-a)+filled*a,0,255).astype(np.uint8)
# clean copy without the ferry, used only as source for the widescreen extensions
ferry=poly([(292,716),(438,716),(438,765),(292,765)])
clean=cv2.inpaint(plate,ferry,7,cv2.INPAINT_TELEA)

# --- extend to widescreen ---
EXT=588; WW=W+2*EXT
wide = np.zeros((H,WW,3),np.float32)
wide[:,EXT:EXT+W]=plate

def blend_ext(patch, side):
    p = patch.astype(np.float32)
    band = (wide[:,EXT:EXT+50] if side=='L' else wide[:,EXT+W-50:EXT+W])
    edge = cv2.GaussianBlur(band.mean(axis=1,keepdims=True),(1,31),0)
    pband = (p[:,-50:] if side=='L' else p[:,:50]).mean(axis=1,keepdims=True)
    pband = cv2.GaussianBlur(pband,(1,31),0)
    w = p.shape[1]
    ramp = (np.linspace(1,.35,w) if side=='R' else np.linspace(.35,1,w))[None,:,None]
    return np.clip(p+(edge-pband)*ramp,0,255)

# left extension borrows the middle sky/water, flipped & vertically nudged above the horizon
def warp_sky(p, dy, sx=1.0, horizon=620):
    q=p.copy()
    M=np.float32([[sx,0,0],[0,1,dy]])
    warped=cv2.warpAffine(p,M,(p.shape[1],p.shape[0]),borderMode=cv2.BORDER_REFLECT)
    # keep the horizon band pinned: shift fades out toward the horizon
    t=np.clip((horizon-np.arange(p.shape[0]))/100,0,1)[:,None,None]
    return (warped*t+q*(1-t))
srcL = clean[:,60:60+EXT+60][:,::-1].astype(np.float32)   # includes seam overlap
srcR = clean[:,20:20+EXT+60].astype(np.float32)
srcL = warp_sky(srcL,-70)
srcR = warp_sky(srcR,55)
L_ext = blend_ext(srcL,'L'); R_ext = blend_ext(srcR,'R')
wl = np.linspace(0,1,60)[None,:,None]
wide[:,:EXT]=L_ext[:,:EXT]
wide[:,EXT:EXT+60]=L_ext[:,EXT:EXT+60]*(1-wl)+wide[:,EXT:EXT+60]*wl
wide[:,EXT+W:]=R_ext[:,60:60+EXT]
wide[:,EXT+W-60:EXT+W]=wide[:,EXT+W-60:EXT+W]*(1-wl)+R_ext[:,:60]*wl
# far shoreline runs unbroken through the extensions
sh=plate[694:764,450:690].astype(np.float32); sh=np.concatenate([sh,sh[:,::-1]],axis=1)
sh=np.tile(sh,(1,WW//sh.shape[1]+2,1))[:,:WW]
sa=np.ones((70,WW,1),np.float32); sa[:14]=np.linspace(0,1,14)[:,None,None]
ramp=np.zeros(WW,np.float32); ramp[:EXT-30]=1; ramp[EXT+W+30:]=1
ramp=cv2.GaussianBlur(ramp[None],(0,0),sigmaX=26)[0]; sa=sa*ramp[None,:,None]
edge=wide[694:764]; shift=(wide[684:690].mean(axis=0,keepdims=True)-sh[:6].mean(axis=0,keepdims=True))*.0
wide[694:764]=edge*(1-sa)+(sh+shift)*sa
wide=wide.clip(0,255).astype(np.uint8)

# --- foreground on the wide canvas: couple plus a railing tiled across the full width ---
fgc=np.dstack([I,(fg_a*255).astype(np.uint8)])
WF=np.zeros((H,WW,4),np.uint8)
WF[:,EXT:EXT+W]=fgc
np.save(dbg+'/fg_preview.npy',fg_a)

# find finial spacing from the top-rail on the left, tile one module outward
MOD_X0,MOD_X1=62,150   # one finial-to-finial bay on the left side, clear of the couple
mod=np.dstack([I,(rail_alpha*255).astype(np.uint8)])[1030:,MOD_X0:MOD_X1].copy()
mod_w=MOD_X1-MOD_X0
# remove rocks from the tile
mod[-58:,:,3]=mod[-58-58:-58,:,3]; mod[-58:,:,:3]=mod[-58-58:-58,:,:3]
x=EXT+MOD_X0-mod_w
while x>-mod_w:
    x0=max(x,0); WF[1030:,x0:x+mod_w]=mod[:,x0-x:]; x-=mod_w
# right side: the big post in the art ends the source width, keep tiling beyond it
x=EXT+W
while x<WW:
    x1=min(x+mod_w,WW); WF[1030:,x:x1]=mod[:,:x1-x]; x+=mod_w

statue_rgba=np.dstack([I,(statue_full*255).astype(np.uint8)])
SW=np.zeros((H,WW,4),np.uint8); SW[:,EXT:EXT+W]=statue_rgba

def save(a,name,q=84,alpha=False):
    if a.shape[2]==4: im=Image.fromarray(np.dstack([a[...,2],a[...,1],a[...,0],a[...,3]]),'RGBA')
    else: im=Image.fromarray(a[...,::-1])
    im.save(f'{out}/{name}.webp',quality=q,method=6,alpha_quality=88)
save(wide,'lake-plate',q=82)
y0=760; 
save(WF[y0:],'lake-couple',q=86)
ys=380
save(SW[ys:1050,EXT:EXT+340],'lake-statue',q=86)
# opening still for first paint and no-WebGL fallback
comp=wide.astype(np.float32)
for ly in (SW,WF):
    a=ly[...,3:4]/255.; comp=comp*(1-a)+ly[...,:3]*a
save(comp.astype(np.uint8),'lake-still',q=78)
Image.fromarray(fg_a.__mul__(255).astype(np.uint8)).save(dbg+'/fg_a.png')
Image.fromarray(comp.astype(np.uint8)[...,::-1]).resize((WW//2,H//2)).save(dbg+'/s1_comp.png')
Image.fromarray(wide[...,::-1]).resize((WW//2,H//2)).save(dbg+'/s1_plate.png')
chk=np.zeros((H,WW,3),np.uint8); chk[:]=(190,60,190)
a=WF[...,3:4]/255.; chk=(chk*(1-a)+WF[...,:3]*a).astype(np.uint8)
a=SW[...,3:4]/255.; chk=(chk*(1-a)+SW[...,:3]*a).astype(np.uint8)
Image.fromarray(chk[...,::-1]).resize((WW//2,H//2)).save(dbg+'/s1_layers.png')
print('ok',WW,H)
