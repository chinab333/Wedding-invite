// Paints the invitation's illustrated plates as SVG, rendered to raster by tools/render_art.sh.
// Figures follow Bundi miniature convention: profile faces, fish eye, flared jama and ghagra, curled cloud bands.
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });

const C = { verm:'#b5361f', vermD:'#7d2015', maroon:'#5c1718', red:'#9c1f24', gold:'#c79a3e', goldL:'#e6c671', cream:'#f0e2c4',
  sand:'#d0a46a', sandD:'#a87a45', sandDD:'#7c5531', teal:'#2f7a78', tealD:'#1c4f54', tealL:'#6fb3a8', indigo:'#1f2d52', indigoL:'#3d5480',
  green:'#3d6a4a', greenD:'#24483a', ink:'#21140f', skin:'#c88a5c', skinD:'#a56b43', saffron:'#de7a26', white:'#f4ecdc' };
let seed = 7; const R = (a=1,b)=>{ seed=(seed*16807)%2147483647; const r=(seed-1)/2147483646; return b===undefined? r*a : a+r*(b-a); };
const defs = `<defs>
 <filter id="paint" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="11" result="w"/>
  <feDisplacementMap in="SourceGraphic" in2="w" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="4" seed="4" result="m"/>
  <feColorMatrix in="m" type="matrix" values="0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .32  .9 0 0 0 -.33" result="mott"/>
  <feComposite in="mott" in2="d" operator="in" result="mott2"/>
  <feBlend in="d" in2="mott2" mode="soft-light" result="a"/>
  <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 .18  0 0 0 0 .11  0 0 0 0 .06  0 0 0 .62 -.2" result="gr"/>
  <feComposite in="gr" in2="d" operator="in" result="gr2"/>
  <feBlend in="a" in2="gr2" mode="multiply"/>
 </filter>
</defs>`;
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<g filter="url(#paint)">${body}</g></svg>`;

// Cusped Rajput arch: straight jambs, then lobes climbing an ogee to a point.
function arch(x,y,w,h,{lobes=4,spring=.42}={}){
  const cx=x+w/2, sy=y+h*spring; const pts=[];
  for(let i=0;i<=lobes;i++){ const t=i/lobes; pts.push([x+ (w/2)*(1-Math.cos(t*Math.PI/2))**.82, sy-(sy-y)*(Math.sin(t*Math.PI/2)**1.25)]); }
  let d=`M${x} ${y+h}L${x} ${sy}`;
  for(let i=1;i<pts.length;i++){ const [a,b]=pts[i],[pa,pb]=pts[i-1],r=Math.hypot(a-pa,b-pb)*.54; d+=`A${r} ${r} 0 0 1 ${a} ${b}`; }
  for(let i=pts.length-2;i>=0;i--){ const [a,b]=pts[i],[na,nb]=pts[i+1],r=Math.hypot(a-na,b-nb)*.54; d+=`A${r} ${r} 0 0 1 ${2*cx-a} ${b}`; }
  return d+`L${x+w} ${y+h}Z`;
}
const curlCloud=(x,y,s,fill,hi)=>`<g transform="translate(${x} ${y}) scale(${s})"><path fill="${fill}" d="M-120 0c8-16 30-22 42-12 4-20 36-30 52-14 10-18 44-20 56 0 14-12 42-6 46 12 12-4 28 2 30 14z"/><path fill="none" stroke="${hi}" stroke-width="3" d="M-100 -2c8-8 18-10 24-4M-58 -6c6-14 24-16 34-6M0 -8c8-10 26-10 32 2M50 -2c6-6 16-6 22 2"/></g>`;
const mango=(x,y,s,c1=C.greenD,c2=C.green)=>{let o=`<rect x="${x-5*s}" y="${y-60*s}" width="${10*s}" height="${60*s}" fill="#4c3322"/><ellipse cx="${x}" cy="${y-95*s}" rx="${54*s}" ry="${58*s}" fill="${c1}"/>`;
  for(let i=0;i<46;i++){const a=R(6.28),r=R(.1,.95);o+=`<circle cx="${x+Math.cos(a)*50*s*r}" cy="${y-95*s+Math.sin(a)*54*s*r}" r="${R(2,3.6)*s}" fill="${i%3?c2:C.goldL}" opacity="${i%3?.9:.55}"/>`;}return o;};
const cypress=(x,y,s,c=C.greenD)=>`<path fill="${c}" d="M${x} ${y-150*s}c${16*s} ${40*s} ${22*s} ${90*s} ${14*s} ${150*s}h-${28*s}c-${8*s} -${60*s} -${2*s} -${110*s} ${14*s} -${150*s}z"/>`;
const pavilion=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><path fill="${C.white}" d="M-46 0v-60h92v60z"/><path fill="#e6d7bb" d="M-52-60h104v-8h-104z"/><path fill="${C.white}" d="M-34-68c0-26 16-34 34-44 18 10 34 18 34 44z"/><path d="M0-112v-14" stroke="${C.gold}" stroke-width="3"/><path fill="${C.tealD}" d="${arch(-14,-50,28,50,{lobes:3})}"/><path fill="${C.tealD}" d="${arch(-40,-44,18,44,{lobes:2})}"/><path fill="${C.tealD}" d="${arch(22,-44,18,44,{lobes:2})}"/></g>`;
const marigold=(x,y,r,c=C.saffron)=>{let o='';for(let i=0;i<9;i++){const a=i/9*6.283;o+=`<circle cx="${x+Math.cos(a)*r*.62}" cy="${y+Math.sin(a)*r*.62}" r="${r*.5}" fill="${c}"/>`;}return o+`<circle cx="${x}" cy="${y}" r="${r*.42}" fill="#efa93a"/>`;};
function garland(pts,r=8.5){let o='';for(let i=0;i<pts.length-1;i++){const[a,b]=pts[i],[c,d]=pts[i+1],n=Math.ceil(Math.hypot(c-a,d-b)/(r*1.45));for(let k=0;k<n;k++){const t=k/n;o+=marigold(a+(c-a)*t,b+(d-b)*t,r,(k+i)%3==2?'#b5361f':k%2?C.saffron:'#e9962e');}}return o;}
const diya=(x,y,s=1,lit=true)=>`<g transform="translate(${x} ${y}) scale(${s})">${lit?`<circle cy="-34" r="34" fill="${C.goldL}" opacity=".22"/><circle cy="-30" r="18" fill="${C.goldL}" opacity=".3"/><path fill="#f6c655" d="M0-48c10 14 11 22 0 28-11-6-10-14 0-28z"/><path fill="#fff1c0" d="M0-34c4 6 5 10 0 14-5-4-4-8 0-14z"/>`:''}<path fill="#8d4a22" d="M-26-20c10 6 42 6 52 0-2 16-14 24-26 24s-24-8-26-24z"/><path fill="none" stroke="${C.goldL}" stroke-width="2" d="M-22-14c10 5 34 5 44 0"/></g>`;
const kalash=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path fill="#b4702e" d="M-34 0c-30-26-30-74 0-92h68c30 18 30 66 0 92z"/><path fill="#cf8f47" d="M-16-88c-14 18-16 56-4 80h-10c-18-20-20-58-2-80z"/><path fill="${C.verm}" d="M-44-52h88v12h-88z"/><path fill="#b4702e" d="M-22-92v-14h44v14z"/><path fill="${C.greenD}" d="M-44-106c10-24 26-30 30-34 2 16-6 28-12 34zM44-106c-10-24-26-30-30-34-2 16 6 28 12 34zM-16-106c-2-22 10-40 16-46 6 6 18 24 16 46z"/><circle cy="-126" r="20" fill="#8a5a2f"/><path stroke="#5f3b1d" stroke-width="2" fill="none" d="M-12-132c8-6 16-6 24 0M-14-124c8-4 18-4 28 0"/><path fill="${C.goldL}" d="M-5-40h10v22h-10z"/></g>`;

// Profile head. Origin at the neck base, facing +x.
function head(kind){
  const hair=C.ink, skin=C.skin;
  const face=`<path fill="${skin}" d="M-6 6c-2-8-3-14-6-22-14-4-22-20-20-38 2-22 20-34 40-30 10 2 18 8 20 16 2 8 1 12 3 18 2 4 8 8 8 12 0 3-4 3-6 4 2 3 2 5 0 7 2 3 1 6-2 7 1 6-1 10-6 11-7 2-14 0-18 1-2 4-1 10 1 15z"/>
   <path fill="none" stroke="${C.skinD}" stroke-width="1.5" d="M26-30c1 3 0 6-2 8M36-14c-4 1-6 1-9 1"/>
   <path fill="#fff6e6" d="M8-40c7-6 17-6 24-2-7 6-17 7-24 2z"/><circle cx="21" cy="-41" r="4.3" fill="${hair}"/>
   <path fill="none" stroke="${hair}" stroke-width="2.4" d="M4-38c8-9 20-9 30-3M8-52c8-5 18-5 26-2"/><path fill="none" stroke="${hair}" stroke-width="1.6" d="M32-41l12 1"/>`;
  if(kind==='groom') return `<g>${face}
   <path fill="${hair}" d="M-30-34c-6 10-4 26 2 34l10-4c-4-8-4-16-2-26z"/><path fill="${hair}" d="M18-14c8-4 14-4 20 0-4 4-14 6-24 4 0-2 2-3 4-4z"/>
   <path fill="${C.saffron}" d="M-34-50c-6-20 14-44 44-44 20 0 32 12 32 26-16-6-46-2-64 10-6 4-10 8-12 8z"/>
   <path fill="#c75e1c" d="M-36-46c20-22 50-30 80-24l-2 8c-28-5-54 2-74 22zM-30-70c20-18 44-24 66-20l-6 6c-20-3-42 3-58 18z"/>
   <path fill="${C.goldL}" d="M-32-56c20-18 46-24 72-20l-1 4c-26-4-50 2-68 19z"/>
   <path fill="${C.gold}" d="M26-92c10-12 12-22 8-32 10 6 14 22 4 36z"/><circle cx="33" cy="-84" r="5" fill="${C.verm}"/><circle cx="33" cy="-84" r="2.2" fill="${C.cream}"/>
   <path fill="none" stroke="${C.cream}" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round" d="M-14 8c10 12 26 14 36 6"/><circle cx="-4" cy="-18" r="4" fill="${C.goldL}"/></g>`;
  return `<g><path fill="${hair}" d="M-30-30c-14 14-24 60-20 130 8 6 16 4 22-2-2-40 2-90 16-126z"/>${face}
   <path fill="${hair}" d="M-30-34c-4-24 16-46 44-44 10 1 16 4 20 10-16-4-34 2-44 16-6 8-10 16-20 18z"/>
   <path fill="${C.goldL}" d="M4-76l4 18-6 4-5-5z"/><circle cx="4" cy="-52" r="4" fill="${C.verm}"/><circle cx="16" cy="-58" r="2.2" fill="${C.verm}"/>
   <path fill="none" stroke="${C.goldL}" stroke-width="2.5" d="M34-20c-6 2-8 8-4 12"/><circle cx="30" cy="-7" r="2" fill="${C.cream}"/><path fill="${C.goldL}" d="M-12-18l6 3v8c-2 4-6 4-8 0v-8z"/>
   <path fill="none" stroke="${C.goldL}" stroke-width="2" stroke-dasharray="2 3" d="M-12 6c8 16 28 18 40 6"/></g>`;
}
const hand=(x,y,rot=0,skin=C.skin,mehndi=false)=>`<g transform="translate(${x} ${y}) rotate(${rot})"><path fill="${skin}" d="M-7-6c6-2 12-2 15 0 6 0 14 1 19 3 2 2 0 4-3 4l-9-1c5 2 7 3 8 5 0 2-3 3-5 2l-9-3c2 2 3 4 1 6-2 1-4 0-6-1-7 1-13-2-17-4z"/>${mehndi?`<path fill="none" stroke="${C.vermD}" stroke-width="1.3" d="M-2 0l14 0M4-3l2 6"/>`:''}</g>`;
const arm=(sx,sy,ex,ey,hx,hy,col,w=24,skin=null)=>`<path fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" d="M${sx} ${sy}Q${ex} ${ey} ${hx} ${hy}"/>`+(skin?`<path fill="none" stroke="${skin}" stroke-width="${w*.56}" stroke-linecap="round" d="M${(ex+hx)/2} ${(ey+hy)/2}L${hx} ${hy}"/>`:'');

// Full figures. Origin at the feet, facing +x, 500 units tall.
function groom({x,y,s=1,flip=false,armF='',armB=''}){
  const sk=`<g fill="none" stroke="#c9a874" stroke-width="1.3">`+[-58,-42,-26,-10,6,22,38,54].map(v=>`<path d="M${v*.34} -226L${v} -68"/>`).join('')+'</g>';
  return `<g transform="translate(${x} ${y}) scale(${flip?-s:s} ${s})">
   ${armB}
   <path fill="#e4d2ae" d="M-16-70l-2 62h16l6-62zM6-70l2 62h16l4-62z"/><path fill="${C.verm}" d="M-20-10h22c6 2 16 6 18 10h-40zM4-10h22c6 2 16 6 18 10H4z"/>
   <path fill="${C.cream}" d="M-24-236c-10 40-34 110-44 168 40 12 104 12 142 0-12-60-34-128-46-168z"/>${sk}
   <path fill="none" stroke="${C.gold}" stroke-width="7" d="M-68-68c40 12 104 12 142 0"/><path fill="none" stroke="${C.verm}" stroke-width="2" stroke-dasharray="3 7" d="M-66-76c40 12 98 12 136 0"/>
   <path fill="${C.cream}" d="M-34-356c10-8 44-8 62 2 8 40 6 86 0 124h-52c-8-40-14-86-10-126z"/><path fill="none" stroke="#c9a874" stroke-width="2" d="M6-352c-6 30-6 60 4 118"/>
   <path fill="${C.maroon}" d="M-27-238h56v18h-56z"/><path fill="${C.maroon}" d="M6-222h20l6 106-14 6-14-6z"/><path fill="${C.gold}" d="M4-126l14 6 14-6v6l-14 6-14-6z"/><path fill="${C.gold}" d="M-27-238h56v3h-56zM-27-223h56v3h-56z"/>
   <g fill="none" stroke="${C.goldL}" stroke-width="3" stroke-dasharray=".5 6" stroke-linecap="round"><path d="M-14-356c2 30 14 46 30 50"/><path d="M-18-352c0 40 14 62 36 70"/></g>
   <g transform="translate(-1 -358)">${head('groom')}</g>
   ${armF}</g>`;
}
function bride({x,y,s=1,flip=false,armF='',armB=''}){
  let buti='';for(let i=0;i<34;i++){const t=R(.05,.92),sp=(-20-t*72)+R(0,1)*(46+t*150);buti+=`<circle cx="${sp}" cy="${-222+t*170}" r="2.4" fill="${C.goldL}" opacity=".9"/>`;}
  return `<g transform="translate(${x} ${y}) scale(${flip?-s:s} ${s})">
   <path fill="${C.verm}" opacity=".94" d="M-42-348c-40 90-70 240-84 348h58c6-110 20-240 44-330z"/><path fill="none" stroke="${C.gold}" stroke-width="7" d="M-122 0c14-108 44-258 84-346"/>
   ${armB}
   <path fill="${C.red}" d="M-20-230c-22 60-64 150-76 228 54 10 128 10 180 0-14-80-44-170-62-228z"/>${buti}
   <path fill="${C.gold}" d="M-96-22c54 10 128 10 180 0l2 16c-54 10-132 10-186 0z"/><path fill="none" stroke="${C.maroon}" stroke-width="2.4" d="M-92-14c54 10 124 10 172 0"/>
   <path fill="none" stroke="${C.gold}" stroke-width="3" d="M-68-100c38 10 88 10 128 0"/>
   <path fill="${C.verm}" d="M-16-6c8 0 30 2 36 6h-40zM14-6c8 0 30 2 36 6H12z"/>
   <path fill="${C.maroon}" d="M-22-338c10-8 32-8 44-2 6 22 8 70 4 110h-48c-4-40-4-84 0-108z"/><path fill="${C.skin}" d="M-20-264c12 4 32 4 44 0v34h-48z"/><path fill="${C.gold}" d="M-24-232h50v5h-50z"/>
   <g fill="none" stroke="${C.goldL}" stroke-width="2.6" stroke-dasharray=".5 5" stroke-linecap="round"><path d="M-10-336c0 18 8 30 22 32"/></g>
   <g transform="translate(0 -342)">${head('bride')}</g>
   <path fill="${C.verm}" opacity=".82" d="M-40-428c-22 20-34 56-32 86 10 4 24 4 32-2l16-30c-6-4-8-10-6-18 10-22 30-32 46-34-16-10-36-14-56-2z"/>
   <path fill="none" stroke="${C.gold}" stroke-width="5" d="M20-420c-24 2-44 18-50 40-2 8 0 14 6 18-6 8-14 20-20 30"/>
   ${armF}</g>`;
}
function frame(inner,{ground=C.teal,w=880,h=1120}){
  const outer=arch(10,10,w-20,h-20,{lobes:5,spring:.36}), mid=arch(38,38,w-76,h-76,{lobes:5,spring:.36}), inn=arch(58,58,w-116,h-116,{lobes:5,spring:.36});
  return `<clipPath id="in"><path d="${inn}"/></clipPath>
  <path fill="${C.vermD}" d="${outer}"/><path fill="none" stroke="${C.gold}" stroke-width="3" d="${outer}" transform="translate(0 0)"/>
  <path fill="none" stroke="${C.goldL}" stroke-width="8" stroke-dasharray="1 17" stroke-linecap="round" d="${arch(24,24,w-48,h-48,{lobes:5,spring:.36})}"/>
  <path fill="${C.gold}" d="${mid}"/><path fill="${ground}" d="${inn}"/>
  <g clip-path="url(#in)">${inner}</g>
  <path fill="none" stroke="${C.ink}" stroke-width="3" d="${inn}"/>`;
}
const skyBand=(col1='#1f4f73',col2='#2d6f8e')=>`<rect width="880" height="900" fill="${col1}"/><rect y="240" width="880" height="660" fill="${col2}" opacity=".7"/>${curlCloud(220,120,1.2,C.cream,C.gold)}${curlCloud(640,90,1.05,'#e9d7b5',C.gold)}${curlCloud(470,200,.8,C.cream,C.gold)}${curlCloud(120,260,.66,'#e9d7b5',C.gold)}${curlCloud(780,250,.72,C.cream,C.gold)}`;
const land=(y,c1=C.tealL,c2=C.green)=>`<path fill="${c2}" d="M0 ${y}c120-34 220-22 340-6 140 18 300 10 540-20v700H0z"/><path fill="${c1}" d="M0 ${y+90}c220-20 520-14 880 0v700H0z"/>`;
const flowers=(y,n=26,c=C.goldL)=>{let o='';for(let i=0;i<n;i++){const x=R(60,820),yy=y+R(0,150);o+=`<g transform="translate(${x} ${yy})"><path stroke="${C.greenD}" stroke-width="2" d="M0 0v-14"/><circle cy="-16" r="3.4" fill="${i%3?c:C.verm}"/></g>`;}return o;};
const carpet=(y)=>`<path fill="${C.maroon}" d="M60 ${y}h760l50 200H10z"/><path fill="none" stroke="${C.gold}" stroke-width="5" d="M84 ${y+14}h712l36 170H48z"/><g fill="${C.goldL}">${Array.from({length:30},()=>`<circle cx="${R(90,790)}" cy="${R(y+28,y+170)}" r="2.6"/>`).join('')}</g>`;

/* ---- The eight rituals ---- */
const M={};
M.m1=()=>{ // Ganesh pujan
  const ga=`<g transform="translate(440 690)">
    <path fill="${C.tealD}" d="${arch(-220,-470,440,520,{lobes:4,spring:.45})}"/><path fill="none" stroke="${C.gold}" stroke-width="6" d="${arch(-220,-470,440,520,{lobes:4,spring:.45})}"/>
    <path fill="${C.goldL}" opacity=".12" d="${arch(-190,-440,380,490,{lobes:4,spring:.45})}"/>
    <path fill="#bf4a1c" d="M-110 40c-30-70-24-130 0-170 40-28 180-28 220 0 24 40 30 100 0 170z"/>
    <path fill="${C.saffron}" opacity=".5" d="M-50-120c-14 50-10 110 8 150h-40c-24-60-20-120 4-150z"/>
    <path fill="${C.goldL}" d="M-110 44h220v12h-220z"/><path fill="${C.verm}" d="M-120 54h240l14 34h-268z"/><path fill="none" stroke="${C.gold}" stroke-width="4" d="M-122 60h244"/>
    <path fill="${C.maroon}" d="M-110 -6c50 20 170 20 220 0v50h-220z"/><g fill="${C.goldL}"><circle cx="-60" cy="22" r="3"/><circle cx="0" cy="26" r="3"/><circle cx="60" cy="22" r="3"/><circle cx="-30" cy="30" r="2"/><circle cx="30" cy="30" r="2"/></g>
    <!-- arms -->
    <path fill="none" stroke="#d45a24" stroke-width="34" stroke-linecap="round" d="M-100-110C-170-130-180-180-160-230M100-110C170-130 180-180 160-230"/>
    <path fill="none" stroke="#d45a24" stroke-width="36" stroke-linecap="round" d="M-96-70C-140-50-120-10-70-10M96-70C140-50 130-30 92-14"/>
    <circle cx="-160" cy="-248" r="20" fill="#d45a24"/><circle cx="160" cy="-248" r="20" fill="#d45a24"/>
    <path fill="${C.gold}" d="M-160-268l-30-46 22 8 8-22 8 22 22-8zM150-300c20-10 40-6 44 8s-16 24-30 18l-6 22-14-4 6-22z"/>
    <path fill="#efd27a" d="M-86-38c0 14 28 14 28 0-2-14-26-14-28 0z"/><path fill="${C.goldL}" d="M60-22l34 4-2 16-34-2z"/>
    <!-- ears -->
    <path fill="#d45a24" d="M-60-270c-70-46-130-24-120 40 6 40 60 70 110 40zM60-270c70-46 130-24 120 40-6 40-60 70-110 40z"/>
    <path fill="#efa47a" d="M-74-254c-46-22-84-8-78 28 4 24 40 42 74 26zM74-254c46-22 84-8 78 28-4 24-40 42-74 26z"/>
    <!-- head and trunk -->
    <path fill="#e0682a" stroke="#7d2015" stroke-width="3.5" d="M-78-268c0-52 156-52 156 0 8 50-10 94-36 112-6 40-4 74-36 104-16 16-6 40 18 34 14-2 22 14 8 22-40 18-78-10-66-60 6-24 0-50-10-100-22-18-34-62-26-112z"/>
    <path fill="none" stroke="#efa47a" stroke-width="3" d="M-18-120c6 4 26 4 34 0M-14-100c6 4 18 4 24 0M-12-80c4 3 14 3 18 0M-10-60c3 3 10 3 14 0"/>
    <path fill="#fff6e6" d="M-40-212c8-8 20-8 26 0-7 6-19 6-26 0zM14-212c7-8 19-8 26 0-7 6-19 6-26 0z"/><circle cx="-27" cy="-212" r="4.5"/><circle cx="27" cy="-212" r="4.5"/>
    <path fill="${C.cream}" d="M34-146c8 20 12 36 10 50-10-8-20-26-22-40z"/>
    <path fill="${C.verm}" d="M-5-262h10v26c0 8-10 8-10 0z"/><path fill="none" stroke="${C.cream}" stroke-width="3" d="M-30-246c20 10 40 10 60 0"/>
    <!-- crown -->
    <path fill="${C.gold}" d="M-82-276c0-20 164-20 164 0l-16-82-24 34-20-62-22 46-16-68-16 68-22-46-20 62-24-34z"/>
    <path fill="none" stroke="${C.vermD}" stroke-width="2.5" d="M-74-288c40-12 108-12 148 0"/><circle cy="-318" r="9" fill="${C.verm}"/><circle cx="-40" cy="-306" r="5" fill="${C.teal}"/><circle cx="40" cy="-306" r="5" fill="${C.teal}"/>
    <g fill="none" stroke="${C.cream}" stroke-width="3" stroke-dasharray=".5 6" stroke-linecap="round"><path d="M-74-96c36 44 112 44 148 0"/><path d="M-60-76c30 40 90 40 120 0"/></g>
  </g>`;
  return frame(`${skyBand('#173f60','#22627c')}${land(420,'#8b6a43','#5e4a2f')}${carpet(800)}${ga}
    ${diya(180,950,1.15)}${diya(700,950,1.15)}${kalash(120,860,.8)}${kalash(760,860,.8)}
    <g transform="translate(440 950)"><path fill="${C.goldL}" d="M-90 0c20 24 160 24 180 0z"/>${[-52,-26,0,26,52].map(x=>`<circle cx="${x}" cy="-8" r="14" fill="#efd27a"/>`).join('')}${[-38,-12,14,40].map(x=>`<circle cx="${x}" cy="-22" r="13" fill="#e8c460"/>`).join('')}</g>
    ${garland([[150,300],[230,360],[320,400]],9)}${garland([[730,300],[650,360],[560,400]],9)}`,{ground:'#173f60'}); };
M.m2=()=>{ // Varmala
  const gArm=arm(10,-336,74,-352,120,-428,C.cream,26,C.skin)+hand(122,-434,-62);
  const bArm=arm(4,-322,64,-338,108,-420,C.maroon,20,C.skin)+hand(110,-426,-62,C.skin,true);
  const gx=232,bx=648,gs=1.24,bs=1.18,y0=1060;
  const lh=[gx+126*gs,y0-446*gs], rh=[bx-114*bs,y0-438*bs];
  const g=garland([lh,[lh[0]+6,lh[1]+90],[lh[0]+34,lh[1]+165],[440,lh[1]+205],[rh[0]-34,lh[1]+165],[rh[0]-6,lh[1]+90],rh],10);
  return frame(`${skyBand('#1c4d6b','#2f7d8e')}${land(640,'#7fa96f',C.greenD)}${mango(110,800,1.2)}${mango(780,790,1.05)}${cypress(210,780,.9)}${cypress(670,780,.9)}${carpet(890)}
    ${groom({x:gx,y:y0,s:gs,armF:gArm})}${bride({x:bx,y:y0,s:bs,flip:true,armF:bArm})}${g}
    <g transform="translate(440 300)">${Array.from({length:14},()=>`<path transform="translate(${R(-220,220)} ${R(-120,190)}) rotate(${R(360)})" fill="${R()>.5?C.goldL:C.saffron}" d="M0 0c5-6 12-6 15 0-5 6-12 6-15 0z"/>`).join('')}</g>`,{ground:'#1c4d6b'}); };
function closeHand(x,y,rot,col,skin,opts={}){
  const {flip=false,mehndi=false,bangles=null,w=70}=opts;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${flip?-1:1} 1)">
    <path fill="${col}" d="M-420-${w}h300l26 ${w}-26 ${w}h-300z"/>
    ${bangles?bangles.map((b,i)=>`<rect x="${-100-i*15}" y="-${w-2}" width="10" height="${2*w-4}" rx="5" fill="${b}"/>`).join(''):`<path fill="${C.gold}" d="M-132-${w}h14v${2*w}h-14z"/>`}
    <path fill="${skin}" d="M-120-${w-6}h48c30-10 52-14 74-10 40-4 110-2 138 6 12 6 10 20-4 22l-82-2c28 6 72 8 88 14 12 6 8 22-6 22l-84-10c22 8 56 12 68 20 8 8 2 20-10 18l-70-14c14 6 34 14 40 22 4 10-6 18-16 12-34-18-62-22-96-22l-92 4z"/>
    ${mehndi?`<g fill="none" stroke="${C.vermD}" stroke-width="2.2"><circle cx="-30" cy="0" r="24"/><circle cx="-30" cy="0" r="12"/><path d="M-30-24v48M-54 0h48M0-30c30-4 80-4 120 2M4-6c30 0 50 2 96 8M0 14c24 2 40 6 74 14M-90-40c10 10 10 70 0 84M-74-46c8 16 8 76 0 94"/></g><g fill="${C.vermD}"><circle cx="122" cy="-30" r="5"/><circle cx="108" cy="4" r="5"/><circle cx="84" cy="30" r="5"/></g>`:''}
  </g>`;
}
M.m3=()=>{ // Kanyadaan
  return frame(`<rect width="880" height="1120" fill="#10384a"/><rect y="0" width="880" height="1120" fill="#1c5560" opacity=".55"/>
    ${curlCloud(250,150,1.05,C.cream,C.gold)}${curlCloud(650,130,.9,'#e9d7b5',C.gold)}
    <circle cx="440" cy="650" r="360" fill="${C.goldL}" opacity=".08"/><circle cx="440" cy="650" r="240" fill="${C.goldL}" opacity=".08"/>
    ${carpet(960)}
    <!-- brass lota pouring from above -->
    <g transform="translate(610 320) rotate(-38)">
      ${''}<path fill="#c9892f" d="M-74 0c-34 44-30 110 10 136 40 20 94 14 124-10 30-30 26-84-6-126z"/><path fill="#e5b45a" d="M-46 20c-18 34-14 76 8 96-30-16-46-60-26-96z"/><path fill="#a56c22" d="M-58-22h108l16 22h-136z"/><path fill="#e5b45a" d="M-70-34h134v14h-134z"/><path fill="none" stroke="${C.vermD}" stroke-width="3" d="M-70 62c46 18 110 18 158 0"/>
    </g>
    <path d="M520 382C498 440 484 500 470 610" fill="none" stroke="#bfe2e4" stroke-width="12" stroke-linecap="round" opacity=".9"/><path d="M522 386C502 442 490 500 476 600" fill="none" stroke="#fff" stroke-width="3.5" opacity=".85"/>
    ${[[420,700],[500,738],[378,770],[540,800],[445,820]].map(([x,y])=>`<path fill="#bfe2e4" opacity=".9" d="M${x} ${y-16}c8 12 10 18 0 22-10-4-8-10 0-22z"/>`).join('')}
    <!-- parent's supporting hand below, bride's over groom's -->
    ${closeHand(250,860,-4,'#3b5f8e',C.skinD)}
    ${closeHand(640,860,184,'#3b5f8e',C.skinD)}
    ${closeHand(320,700,8,C.cream,C.skin)}
    ${closeHand(250,622,10,C.red,C.skin,{mehndi:true,bangles:[C.gold,C.verm,C.gold,C.verm,C.gold],w:62})}
    ${garland([[120,1010],[300,1040],[440,1046],[580,1040],[760,1010]],10)}
    ${diya(150,1000,1)}${diya(730,1000,1)}`,{ground:'#10384a'}); };
M.m4=()=>{ // Panigrahan
  return frame(`<rect width="880" height="1120" fill="#7a2317"/><rect width="880" height="1120" fill="${C.maroon}" opacity=".35"/>
    <g opacity=".5" stroke="${C.gold}" fill="none" stroke-width="2">${Array.from({length:7},(_,r)=>Array.from({length:7},(_,c)=>{const x=60+c*128+(r%2?64:0),y=130+r*128;return `<path d="M${x} ${y-26}c16 12 16 40 0 52-16-12-16-40 0-52zM${x-26} ${y}c12-16 40-16 52 0-12 16-40 16-52 0z"/>`;}).join('')).join('')}</g>
    <circle cx="440" cy="590" r="280" fill="${C.goldL}" opacity=".1"/>
    ${closeHand(318,640,-7,C.cream,C.skin)}
    ${closeHand(528,604,170,C.red,C.skin,{mehndi:true,bangles:[C.gold,C.verm,C.gold,C.verm,C.gold],w:60})}
    <path fill="none" stroke="#d9331f" stroke-width="7" d="M208 590c-6 40-2 76 6 104M212 602c30 8 40 80 2 92"/>
    <path fill="none" stroke="#e6c671" stroke-width="2.5" stroke-dasharray="6 5" d="M208 590c-6 40-2 76 6 104"/>
    <path fill="${C.verm}" d="M214 694c-16 60-30 150-16 270l-30 4c-20-110-8-210 28-276z"/><path fill="${C.gold}" d="M198 964l-30 4 2 22 32-6z"/>
    ${marigold(150,180,26)}${marigold(730,180,26)}
    ${garland([[80,210],[190,320],[330,380],[440,396],[550,380],[690,320],[800,210]],11)}`,{ground:'#7a2317'}); };
M.m5=()=>{ // Agni pheras
  const flame=`<g transform="translate(440 760)">
     <circle cy="-130" r="240" fill="${C.goldL}" opacity=".12"/><circle cy="-120" r="150" fill="${C.goldL}" opacity=".18"/>
     <path fill="#c43d15" d="M0-300c50 70 120 120 110 220-6 60-50 90-110 90s-104-30-110-90c-6-60 30-100 50-130 4 30 16 44 30 50-8-50 0-100 30-140z"/>
     <path fill="#ec7e1f" d="M6-230c30 50 72 86 66 150-4 40-32 66-72 66s-68-26-72-66c-2-40 20-66 34-86 4 22 12 30 22 34-6-40 2-70 22-98z"/>
     <path fill="#f7c648" d="M4-150c16 30 40 50 36 86-2 26-18 44-40 44s-38-18-40-44c-2-22 10-38 20-48 2 12 6 18 12 20-2-22 2-40 12-58z"/>
     <path fill="#7c5531" d="M-130 -20h260v24h-260z"/><path fill="#a87a45" d="M-160 4h320l26 60h-372z"/><path fill="none" stroke="${C.vermD}" stroke-width="4" d="M-166 26h332"/><g fill="${C.goldL}">${[-130,-90,-50,-10,30,70,110].map(x=>`<path transform="translate(${x} 44)" d="M0-8l8 8-8 8-8-8z"/>`).join('')}</g>
  </g>`;
  const gA=arm(2,-326,30,-260,70,-220,C.cream,24,C.skin)+hand(72,-222,20);
  const bA=arm(4,-314,30,-250,62,-226,C.maroon,20,C.skin);
  return frame(`<rect width="880" height="1120" fill="#0f2747"/><rect y="280" width="880" height="400" fill="#1a3f62" opacity=".7"/>
    ${Array.from({length:60},()=>`<circle cx="${R(60,820)}" cy="${R(60,380)}" r="${R(1,2.6)}" fill="${C.cream}" opacity="${R(.4,.95)}"/>`).join('')}
    ${curlCloud(190,170,.9,'#c9b48c',C.gold)}${curlCloud(680,130,.82,'#c9b48c',C.gold)}
    ${land(610,'#6d5c3f','#203f39')}${pavilion(140,650,.7)}${mango(770,650,.8)}
    <ellipse cx="440" cy="860" rx="340" ry="110" fill="none" stroke="${C.goldL}" stroke-width="4" stroke-dasharray="3 16" stroke-linecap="round"/>
    ${carpet(880).replace(/<g fill.*$/,'')}
    ${flame}
    ${groom({x:150,y:1030,s:.82,armF:gA})}
    ${bride({x:720,y:1030,s:.78,flip:true,armF:bA})}
    <path fill="none" stroke="${C.gold}" stroke-width="7" d="M216 840C330 960 560 980 660 830"/>
    <path fill="none" stroke="${C.verm}" stroke-width="3" d="M216 840C330 960 560 980 660 830"/>
    <g transform="translate(440 926)"><path fill="${C.verm}" d="M-20-10c10-8 30-8 40 0-6 10-34 10-40 0z"/></g>`,{ground:'#0f2747'}); };
M.m6=()=>{ // Saptapadi: seven steps across a lotus tank
  const pos=[[240,1000],[510,920],[300,830],[560,750],[345,680],[560,620],[420,560]];
  let steps='';
  pos.forEach(([x,y],i)=>{const s=1-i*.075;
    steps+=`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="8" rx="94" ry="34" fill="#0c2f38" opacity=".4"/>
     ${[-72,-48,-24,0,24,48,72].map((a,k)=>`<path fill="${k%2?'#e9a0a0':'#f3c6bc'}" transform="rotate(${a*.9}) scale(1 .62)" d="M0 0c-26-34-22-78 0-110 22 32 26 76 0 110z"/>`).join('')}
     <ellipse rx="44" ry="17" fill="#efc65e"/>
     <g fill="#c8321f"><path d="M-16-4c-3-10 4-20 10-18s7 14 2 22c-3 4-11 3-12-4z"/><circle cx="-14" cy="-26" r="3"/><circle cx="-7" cy="-28" r="2.4"/><circle cx="-2" cy="-26" r="2"/>
     <path d="M16-4c3-10-4-20-10-18s-7 14-2 22c3 4 11 3 12-4z"/><circle cx="14" cy="-26" r="3"/><circle cx="7" cy="-28" r="2.4"/><circle cx="2" cy="-26" r="2"/></g>
     </g>`;});
  const pads=Array.from({length:24},()=>{const x=R(70,810),y=R(560,1060);return `<g transform="translate(${x} ${y}) scale(${(y-400)/500})"><ellipse rx="42" ry="17" fill="#3f8a6a"/><path fill="#245e4c" d="M0 0l40-6a42 17 0 0 1 2 9z"/></g>`;}).join('');
  const ripples=Array.from({length:30},()=>{const x=R(70,810),y=R(520,1080);return `<path d="M${x} ${y}q18 6 36 0t36 0" fill="none" stroke="#a9dcd2" stroke-width="2" opacity=".5"/>`;}).join('');
  return frame(`<linearGradient id="sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9602e"/><stop offset="1" stop-color="#f0a653"/></linearGradient><rect width="880" height="520" fill="url(#sp)"/>${curlCloud(230,130,1,'#f4dcae',C.vermD)}${curlCloud(650,160,.9,'#f4dcae',C.vermD)}
    <path fill="#2f5660" d="M0 470c100-60 180-80 280-40 110-60 220-50 320 0 90-30 180-20 280 20v80H0z"/>
    <path fill="${C.sand}" d="M0 490h880v34H0z"/><g>${Array.from({length:14},(_,i)=>`<path fill="${C.sandD}" d="${arch(14+i*62,496,38,28,{lobes:2})}"/>`).join('')}</g>
    <rect y="522" width="880" height="620" fill="#1d6a70"/><rect y="760" width="880" height="400" fill="#165058"/>
    ${ripples}${pads}${steps}`,{ground:'#1d6a70'}); };
M.m7=()=>{ // Sindoor and mangalsutra
  const beads=(pts)=>{let o='';const n=pts.length-1;for(let i=0;i<n;i++){const[a,b]=pts[i],[c,d]=pts[i+1],k=Math.ceil(Math.hypot(c-a,d-b)/13);for(let j=0;j<k;j++){const t=j/k;o+=`<circle cx="${a+(c-a)*t}" cy="${b+(d-b)*t}" r="6.2" fill="${(j+i)%5==0?C.goldL:C.ink}"/>`;}}return o;};
  const curve=(a,b,c,d,n=30)=>Array.from({length:n+1},(_,i)=>{const t=i/n,u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];});
  return frame(`<rect width="880" height="1120" fill="#27203f"/><rect width="880" height="1120" fill="#3c2348" opacity=".55"/>
    <g opacity=".4" fill="none" stroke="${C.gold}" stroke-width="2"><path d="${arch(150,130,580,700,{lobes:5,spring:.4})}"/></g>
    <path fill="#16344a" d="${arch(170,150,540,690,{lobes:5,spring:.4})}"/>
    ${curlCloud(320,300,.72,'#d9c8a3',C.gold)}${curlCloud(560,250,.62,'#d9c8a3',C.gold)}
    <circle cx="440" cy="420" r="66" fill="#f0dfb0"/><circle cx="462" cy="408" r="60" fill="#16344a"/>
    ${carpet(800)}
    <!-- sindoor box -->
    <g transform="translate(300 930)"><ellipse cy="24" rx="150" ry="26" fill="#000" opacity=".3"/>
      <path fill="#b98232" d="M-120-90c0 40 0 76 16 112 60 16 148 16 208 0 16-36 16-72 16-112z"/><path fill="#e0b25a" d="M-96-60c-6 30-2 60 8 84h-20c-12-30-14-60-8-84z"/>
      <path fill="none" stroke="${C.vermD}" stroke-width="3" d="M-116-36c60 16 172 16 232 0"/><g fill="${C.vermD}">${[-80,-40,0,40,80].map(x=>`<path transform="translate(${x} -8)" d="M0-14l10 14-10 14-10-14z"/>`).join('')}</g>
      <ellipse cy="-90" rx="120" ry="30" fill="#7e5420"/><ellipse cy="-92" rx="102" ry="24" fill="#d0281a"/><path fill="#e8402a" d="M-70-96c30-28 110-26 140 0-40 12-100 12-140 0z"/>
      <!-- lid -->
      <g transform="translate(150 -160) rotate(24)"><ellipse rx="112" ry="26" fill="#d9a84d"/><path fill="#b98232" d="M-112 0c20-46 204-46 224 0-30 18-194 18-224 0z"/><circle cy="-30" r="14" fill="#e0b25a"/></g>
    </g>
    <!-- the groom's fingers, a dusting of red -->
    <g fill="#e8402a">${Array.from({length:30},()=>`<circle cx="${R(240,370)}" cy="${R(760,830)}" r="${R(1,3)}" opacity="${R(.5,1)}"/>`).join('')}</g>
    <!-- mangalsutra -->
    <g>${beads(curve([430,600],[390,780],[510,880],[600,900]))}${beads(curve([770,600],[800,780],[690,880],[600,900]))}${beads(curve([430,600],[500,470],[700,470],[770,600]))}
       <path fill="${C.goldL}" d="M600 896c22 0 36 16 34 38-2 20-18 38-34 50-16-12-32-30-34-50-2-22 12-38 34-38z"/><path fill="${C.gold}" d="M600 912c12 0 20 8 19 20-1 12-10 22-19 30-9-8-18-18-19-30-1-12 7-20 19-20z"/><circle cx="600" cy="934" r="7" fill="${C.verm}"/></g>
    ${diya(760,1040,1)}${marigold(120,1040,24)}${marigold(180,1062,18)}`,{ground:'#27203f'}); };
M.m8=()=>{ // Aashirwad
  const elderM=(x,y,flip)=>{const a=arm(0,-300,50,-310,90,-356,'#efe6d2',20,C.skinD)+hand(92,-362,-70,C.skinD);return `<g transform="translate(${x} ${y}) scale(${flip?-.92:.92} .92)"><path fill="#efe6d2" d="M-30-310c-16 80-34 200-44 310h120c-8-110-22-230-34-310z"/><path fill="none" stroke="#c9b48c" stroke-width="2" d="M-8-300l-10 300M8-300l6 300"/><path fill="${C.gold}" d="M-74-8h120v8h-120z"/><g transform="translate(0 -316)"><path fill="#d8d3c8" d="M-30-30c-6 10-4 26 2 34l10-4c-4-8-4-16-2-26z"/>${head('groom').replace(new RegExp(C.saffron,'g'),'#f0ece2').replace(/#c75e1c/g,'#dcd4c2').replace(new RegExp(C.goldL,'g'),'#b5361f').replace(new RegExp(C.gold,'g'),'#b5361f')}</g>${a}</g>`;};
  const elderF=(x,y,flip)=>{const a=arm(0,-290,50,-300,86,-346,'#2e6f73',18,C.skinD)+hand(88,-352,-70,C.skinD);return `<g transform="translate(${x} ${y}) scale(${flip?-.9:.9} .9)"><path fill="#2e6f73" d="M-34-300c-22 90-40 200-54 300h130c-8-110-18-220-30-300z"/><path fill="none" stroke="${C.goldL}" stroke-width="5" d="M-84-2h126"/><path fill="#245659" d="M-46-380c-20 30-32 80-40 170 24 30 44 20 56-20l18-120c12-20 26-30 34-40-20-12-46-12-68 10z"/><g transform="translate(0 -306)">${head('bride')}</g><path fill="#2e6f73" d="M-38-392c-22 20-34 56-32 86 10 4 24 4 32-2l16-30c-6-4-8-10-6-18 10-22 30-32 46-34-16-10-36-14-56-2z"/><path fill="none" stroke="${C.goldL}" stroke-width="4" d="M20-384c-24 2-44 18-50 40"/>${a}</g>`;};
  // couple bowing their heads, seated low at the centre
  const gA=arm(4,-336,40,-300,72,-340,C.cream,24,C.skin);
  return frame(`${skyBand('#1f4f73','#3d7f87')}${land(600,'#8aa864',C.greenD)}${mango(110,720,1)}${mango(780,730,1.1)}${pavilion(440,640,.9)}${carpet(860)}
    ${elderF(140,1030,false)}${elderM(740,1030,true)}
    ${groom({x:360,y:1050,s:.76,armF:arm(4,-330,44,-290,84,-300,C.cream,24,C.skin)})}
    ${bride({x:530,y:1050,s:.72,flip:true,armF:arm(4,-316,40,-270,80,-294,C.maroon,20,C.skin)})}
    ${Array.from({length:42},()=>{const x=R(150,730),y=R(120,720);return `<path transform="translate(${x} ${y}) rotate(${R(360)}) scale(${R(.6,1.1)})" fill="${[C.goldL,C.saffron,C.verm,C.cream][Math.floor(R(4))]}" d="M0 0c5-7 14-7 18 0-5 7-14 7-18 0z"/>`;}).join('')}`,{ground:'#1f4f73'}); };
for(const k of Object.keys(M)) writeFileSync(`${OUT}/${k}.svg`,svg(880,1120,M[k]()));

/* ---- Jharokha balcony: the two lit windows of the haveli ---- */
function jharokha(){
  const w=760,h=980;
  let jali='';for(let r=0;r<4;r++)for(let c=0;c<18;c++){const x=100+c*32,y=800+r*26;jali+=`<path d="M${x} ${y-10}l11 10-11 10-11-10z" fill="#3a2110" stroke="${C.sandD}" stroke-width="1.6"/>`;}
  const col=(x)=>`<path fill="${C.sand}" d="M${x-12} 310h24v470h-24z"/><path fill="${C.sandD}" d="M${x+3} 310h9v470h-9z"/><path fill="${C.sandD}" d="M${x-16} 300h32v14h-32zM${x-16} 766h32v14h-32z"/>`;
  return svg(w,h,`
   <!-- bangaldar roof and finials -->
   <path fill="${C.sandDD}" d="M28 240C150 120 610 120 732 240l-14 44c-140-74-536-74-676 0z"/><path fill="${C.sand}" d="M70 210C190 120 570 120 690 210 560 150 200 150 70 210z"/>
   <path fill="#6b4524" d="${Array.from({length:17},(_,i)=>{const x=64+i*39;return `M${x} ${216-Math.sin(i/16*Math.PI)*76}v-1l5 ${50}h-6z`;}).join('')}"/>
   <path fill="${C.sand}" d="M300 120c0-46 40-64 80-86 40 22 80 40 80 86z"/><path fill="${C.sandDD}" d="M380 34c40 22 80 40 80 86h-30c0-40-20-60-50-86z"/><path stroke="${C.gold}" stroke-width="6" d="M380 34V4"/><circle cx="380" cy="4" r="6" fill="${C.gold}"/>
   ${[110,650].map(x=>`<path fill="${C.sand}" d="M${x-46} 136c0-30 26-44 46-58 20 14 46 28 46 58z"/><path stroke="${C.gold}" stroke-width="4" d="M${x} 78V56"/>`).join('')}
   <!-- cornice -->
   <path fill="${C.sandD}" d="M36 280h688v30H36z"/><g fill="#6b4524">${Array.from({length:30},(_,i)=>`<path d="M${46+i*23} 310h12l-6 18z"/>`).join('')}</g>
   <!-- glowing interior -->
      <!-- arched screen over the interior: three cusped openings -->
   <path fill-rule="evenodd" fill="${C.sand}" d="M76 310h608v470H76z${arch(100,340,560,450,{lobes:5,spring:.42})}"/>
   <path fill="${C.sandDD}" fill-rule="evenodd" d="${arch(92,332,576,458,{lobes:5,spring:.42})}${arch(100,340,560,450,{lobes:5,spring:.42})}"/>
   <path fill="none" stroke="${C.goldL}" stroke-width="2.5" d="${arch(100,340,560,450,{lobes:5,spring:.42})}"/>
   ${marigold(110,360,16,'#b8562a')}${marigold(650,360,16,'#b8562a')}
   ${col(70)}${col(690)}
   <!-- balcony -->
   <path fill="${C.sandD}" d="M30 776h700v18H30z"/><rect x="60" y="794" width="640" height="108" fill="${C.sand}"/>${jali}
   <path fill="${C.sandDD}" d="M30 900h700v20H30z"/>
   <!-- brackets -->
   <path fill="${C.sandD}" d="M120 920h520c-30 20-80 40-260 54-180-14-230-34-260-54z"/>
   ${[170,290,470,590].map(x=>`<path fill="#6b4524" d="M${x-14} 920h28c0 16-6 26-14 34-8-8-14-18-14-34z"/>`).join('')}`);
}
writeFileSync(`${OUT}/jharokha.svg`,jharokha());

/* small painted window for the facade rows */
writeFileSync(`${OUT}/window.svg`,svg(160,230,`
 <path fill="${C.sandD}" d="M6 42c40-30 108-30 148 0l-8 14c-36-18-96-18-132 0z"/><path fill="${C.sand}" d="M60 24c0-12 12-18 20-22 8 4 20 10 20 22z"/>
 <rect x="20" y="56" width="120" height="150" fill="${C.sand}"/><path fill="#2a1c20" d="${arch(36,66,88,130,{lobes:3,spring:.46})}"/>
 <path fill="none" stroke="${C.sandDD}" stroke-width="3" d="${arch(36,66,88,130,{lobes:3,spring:.46})}"/>
 <path fill="${C.sandDD}" d="M8 204h144v12H8z"/><path fill="#6b4524" d="M40 216h80l-12 12H52z"/>`));

/* ---- Bhedaghat: marble gorge on the Narmada at Jabalpur ---- */
function cliff(x0,x1,topFn,base,shade){
  // blocky marble: slabs of uneven width, soft blue-grey shadow sides, leaning strata
  let o='',a=x0;
  o+=`<path fill="${shade[0]}" d="M${x0} ${base}L${x0} ${topFn(x0)}`;for(let x=x0;x<=x1;x+=24)o+=`L${x} ${topFn(x)}`;o+=`L${x1} ${base}z"/>`;
  while(a<x1){
    const w=R()>.72?R(90,190):R(26,72),b=Math.min(a+w,x1),t1=topFn(a)+R(-22,22),t2=topFn(b)+R(-22,22);
    const lit=R()>.42, c=lit?shade[R()>.5?0:2]:shade[1];
    o+=`<path fill="${c}" d="M${a} ${t1}L${(a+b)/2} ${Math.min(t1,t2)-R(0,20)}L${b} ${t2}L${b+R(-6,6)} ${base}L${a+R(-6,6)} ${base}z"/>`;
    if(R()>.55) o+=`<path fill="${shade[3]}" opacity="${R(.18,.42)}" d="M${b-R(8,w*.5)} ${t2+R(0,20)}L${b} ${t2}L${b} ${base}L${b-R(14,w*.6)} ${base}z"/>`;
    const lean=R(-.12,.12);
    for(let k=0;k<7;k++){const y=R(Math.min(t1,t2)+14,base-8);o+=`<path d="M${a} ${y}q${(b-a)/2} ${R(-5,5)} ${b-a} ${(b-a)*lean}" fill="none" stroke="${R()>.45?shade[3]:'#fffaf0'}" stroke-width="${R(.8,2.4)}" opacity="${R(.2,.55)}"/>`;}
    if(R()>.82) o+=`<path fill="#3f5068" opacity=".6" d="M${a} ${(t1+base)/2}l${R(3,7)} ${R(40,130)}l${-R(3,7)} ${R(20,60)}z"/>`;
    a=b;
  }
  return o;
}
const W2=2400,H2=1350;
writeFileSync(`${OUT}/jb-sky.svg`,svg(W2,H2,`
 <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2b52"/><stop offset=".36" stop-color="#3d4f7c"/><stop offset=".6" stop-color="#b06a58"/><stop offset=".74" stop-color="#e79a4e"/></linearGradient>
 <rect width="${W2}" height="${H2}" fill="url(#s)"/>
 ${Array.from({length:120},()=>`<circle cx="${R(W2)}" cy="${R(380)}" r="${R(1,2.8)}" fill="#f4ecdc" opacity="${R(.3,.9)}"/>`).join('')}
 <g transform="translate(1720 170)"><circle r="62" fill="#f3e6c2"/><circle r="110" fill="#f3e6c2" opacity=".09"/></g>
 ${[[420,300,2.1],[1000,400,1.6],[1560,330,1.7],[2120,430,1.9],[700,520,1.3],[1820,560,1.3]].map(([x,y,s])=>curlCloud(x,y,s,'#7d6b83','#d9a877')).join('')}
 <path fill="#54607d" d="M0 800c200-100 380-120 560-70 200-70 420-80 640-10 220-70 500-70 700 10 170-40 340-30 500 30v600H0z"/>
`));
const topA=x=>560+((x-0)/1040)*340+Math.sin(x/90)*30+Math.sin(x/31)*12, topB=x=>900-((x-1360)/1040)*360+Math.sin(x/70)*30+Math.sin(x/27)*12;
const far=['#bfbcc2','#a9b0c2','#cbc7c6','#6f7f9c'], near=['#e6e0d2','#c4c9cf','#efe9da','#7f92ac'];
writeFileSync(`${OUT}/jb-gorge.svg`,svg(W2,H2,`
 <!-- the falls at the gorge's head -->
 <path fill="#e6e4dc" d="M1030 760h340v180h-340z"/><g stroke="#fff" stroke-width="5" opacity=".9">${Array.from({length:30},(_,i)=>`<path d="M${1036+i*11} ${R(760,790)}v${R(90,160)}"/>`).join('')}</g><g stroke="#9fb7c4" stroke-width="3" opacity=".7">${Array.from({length:22},(_,i)=>`<path d="M${1044+i*15} ${R(780,840)}v${R(50,100)}"/>`).join('')}</g>
 ${Array.from({length:28},()=>`<circle cx="${R(1020,1380)}" cy="${R(890,960)}" r="${R(14,44)}" fill="#f6f4ee" opacity="${R(.2,.5)}"/>`).join('')}
 ${cliff(760,1090,x=>700+Math.sin(x/40)*16,980,far)}${cliff(1310,1640,x=>700+Math.sin(x/34)*16,980,far)}
`));
writeFileSync(`${OUT}/jb-river.svg`,svg(W2,H2,`
 <linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb0ac"/><stop offset=".4" stop-color="#2d7077"/><stop offset="1" stop-color="#123c4a"/></linearGradient>
 <path fill="url(#r)" d="M0 960h2400v390H0z"/>
 ${Array.from({length:150},()=>{const y=R(965,1340),t=(y-960)/380,x=R(W2),w=30+t*170;return `<path d="M${x} ${y}q${w/2} ${6+t*6} ${w} 0" fill="none" stroke="${R()>.3?'#cfe6dc':'#e8a968'}" stroke-width="${1+t*2.6}" opacity="${.25+R(.5)}"/>`;}).join('')}
 ${Array.from({length:70},()=>{const y=R(975,1340),t=(y-960)/380,x=1200+R(-120-t*170,120+t*170),w=20+t*90;return `<path d="M${x} ${y}q${w/2} ${3+t*5} ${w} 0" fill="none" stroke="#f6efdc" stroke-width="${1.5+t*3}" opacity="${.3+R(.5)}"/>`;}).join('')}
 <!-- reflected cliffs -->
 ${Array.from({length:120},()=>{const left=R()>.5,y=R(1030,1250),t=(y-1030)/220,reach=980-t*480,x=left?R(0,reach):2400-R(0,reach),w=R(40,190);return `<path d="M${x} ${y}q${w/2} 4 ${w} 0" fill="none" stroke="#c9d2d0" stroke-width="${R(2,6)}" opacity="${.42*(1-t)+.05}"/>`;}).join('')}
 ${cliff(0,1040,topA,1020,near)}${cliff(1360,2400,topB,1020,near)}
 <path fill="#42505e" opacity=".5" d="M0 1014h1040l-40 18H0zM2400 1014h-1040l40 18h1000z"/>
 <!-- a wooden boat, as they ply the gorge -->
 <g transform="translate(1180 1120)"><path fill="#4a2c18" d="M-170-16c60 34 280 34 340 0-14 40-60 56-170 56s-156-16-170-56z"/><path fill="none" stroke="${C.goldL}" stroke-width="3" d="M-164-12c60 30 268 30 328 0"/><path stroke="#2a180c" stroke-width="7" d="M-110 8L-200 90"/><g transform="translate(-40 -16) scale(.26)"><path fill="${C.verm}" d="M-30 0c0-90 10-130 30-150s30 50 30 150z"/><circle cy="-174" r="24" fill="${C.skinD}"/></g><g transform="translate(36 -16) scale(.26)"><path fill="${C.cream}" d="M-30 0c0-90 10-130 30-150s30 50 30 150z"/><circle cy="-174" r="24" fill="${C.skinD}"/></g></g>
 <path fill="#ece6d6" d="M0 1240c200-40 360-40 520 30 60 30 60 60 40 80H0z"/><path fill="#b5bcc4" d="M180 1350c60-70 200-90 380-30 20 8 10 20 0 30z"/>
 <path fill="#dcd9d2" d="M2400 1270c-150-40-300-30-420 40-40 20-40 30-30 40h450z"/>
`));

/* ---- Vector bands, kept as light SVG ---- */
const vec=(w,h,b)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${b}</svg>`;
// Arcade: sandstone wall with open cusped arches; repeats sideways.
{
  const w=420,h=560,a=arch(70,110,280,450,{lobes:5,spring:.4});
  writeFileSync(`${OUT}/arcade.svg`,vec(w,h,`
   <path fill-rule="evenodd" fill="#bc925b" d="M0 0h${w}v${h}H0z${a}"/>
   <path fill="none" stroke="#7c5531" stroke-width="7" d="${a}"/><path fill="none" stroke="#e8c98e" stroke-width="2.5" d="${arch(60,100,300,460,{lobes:5,spring:.4})}"/>
   <path fill="#a87a45" d="M0 0h${w}v18H0z"/><path fill="#7c5531" d="M0 18h${w}v5H0z"/><path fill="#8d6538" d="M0 28h${w}v3H0z"/>
   ${Array.from({length:14},(_,i)=>`<path fill="#7c5531" d="M${i*30+4} 23h22l-11 14z"/>`).join('')}
   <path fill="#a87a45" d="M0 110h28v450H0zM392 110h28v450h-28z"/><path fill="#d8b47c" d="M6 110h8v450H6zM406 110h8v450h-8z"/>
   <g fill="#8d6538"><circle cx="30" cy="66" r="13"/><circle cx="390" cy="66" r="13"/></g><g fill="#bc925b"><circle cx="30" cy="66" r="7"/><circle cx="390" cy="66" r="7"/></g>`));
}
// Painted border band: a running vine, Chitrashala style.
writeFileSync(`${OUT}/vine.svg`,vec(240,56,`
 <rect width="240" height="56" fill="#7d2015"/><path fill="#c79a3e" d="M0 0h240v4H0zM0 52h240v4H0z"/>
 <path fill="none" stroke="#e6c671" stroke-width="3" d="M0 28c30-30 90-30 120 0s90 30 120 0"/>
 <g fill="#e6c671"><path d="M60 8c8 4 10 10 6 16-8-3-11-9-6-16zM180 48c-8-4-10-10-6-16 8 3 11 9 6 16z"/></g>
 <g fill="#f0e2c4"><circle cx="120" cy="28" r="6"/><circle cx="0" cy="28" r="6"/><circle cx="240" cy="28" r="6"/></g><g fill="#b5361f"><circle cx="120" cy="28" r="2.6"/><circle cx="0" cy="28" r="2.6"/><circle cx="240" cy="28" r="2.6"/></g>`));
// Merlons: the kangura battlements of a Rajput parapet, edge between wall and sky.
writeFileSync(`${OUT}/merlon.svg`,vec(96,74,`<path fill="#bc925b" d="M0 74V52h10V30c0-12 12-20 18-30 6 10 18 18 18 30v22h4V30c0 0 0 0 0 0 0-12 12-20 18-30 6 10 18 18 18 30v22h10v22z"/>`));
/* ---- The Narmada carries on below the gorge, under the RSVP. Same user-space coordinates as jb-river, so its water and rocks run on across the seam. ---- */
{
 const top=1338,H3=1512,end=top+H3;
 const damp=(x,w)=>Math.abs(x+w/2-1200)<520?.3:1; // quieter behind the RSVP text
 const ripples=Array.from({length:250},()=>{const y=R(1356,end-10),x=R(-40,W2),w=R(90,240),gold=R()>.72;return `<path d="M${x} ${y}q${w/2} ${R(6,12)} ${w} 0" fill="none" stroke="${gold?'#e8a968':'#cfe6dc'}" stroke-width="${R(1.6,3.6)}" opacity="${(.2+R(.42))*damp(x,w)}"/>`;}).join('');
 writeFileSync(`${OUT}/jb-river-more.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="${W2}" height="${H3}" viewBox="0 ${top} ${W2} ${H3}">${defs}<g filter="url(#paint)">
 <linearGradient id="r2" gradientUnits="userSpaceOnUse" x1="0" y1="960" x2="0" y2="${end}"><stop offset="0" stop-color="#7fb0ac"/><stop offset="${156/(end-960)}" stop-color="#2d7077"/><stop offset="${390/(end-960)}" stop-color="#123c4a"/><stop offset="1" stop-color="#0f3344"/></linearGradient>
 <path fill="url(#r2)" d="M-60 900h2520v${end-900+60}H-60z"/>
 ${ripples}
 ${Array.from({length:46},()=>{const y=R(1340,1660),f=1-(y-1350)/310,x=1200+R(-300,300),w=R(50,130);return `<path d="M${x-w/2} ${y}q${w/2} 7 ${w} 0" fill="none" stroke="#f6efdc" stroke-width="${R(2.4,4.4)}" opacity="${(.35+R(.45))*f}"/>`;}).join('')}
 <path fill="#0c2b3a" opacity=".45" d="M-60 1440c200 40 460 50 650-30l-20 70c-200 60-440 60-630 20zM2460 1430c-180 40-380 50-540-20l20 60c170 60 370 60 520 20z"/>
 <path fill="#ece6d6" d="M0 1240c200-40 360-40 520 30 60 30 60 60 40 80-24 46-120 96-280 116-110 14-220 6-280-14z"/><path fill="#b5bcc4" d="M180 1350c60-70 200-90 380-30 20 8 10 20 0 30-24 46-120 96-230 108-60-34-130-66-150-108z"/>
 <path fill="#dcd9d2" d="M2400 1270c-150-40-300-30-420 40-40 20-40 30-30 40 30 50 130 100 270 110 70 5 130 0 180-14z"/><path fill="#b5bcc4" d="M2400 1380c-90 0-170 20-220 80 80 6 160 2 220-14z"/>
 <path fill="#ece6d6" d="M-60 2640c170-60 340-50 470 30 60 40 40 110-20 180H-60z"/><path fill="#b5bcc4" d="M70 2850c50-70 180-110 320-70 30 10 20 40 0 70z"/>
 <path fill="#dcd9d2" d="M2460 2560c-160-40-330-20-440 70-60 50-50 140-10 220h450z"/><path fill="#b5bcc4" d="M2460 2700c-120-20-250 10-340 90-10 20-10 40 0 60h340z"/>
 </g></svg>`);
}
console.log('art written');
