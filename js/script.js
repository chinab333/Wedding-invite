(() => {
  'use strict';
  const DATA = window.WEDDING;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a));              // progress of p inside [a,b]
  const ease = t => t * t * (3 - 2 * t);
  const easeOut = t => 1 - (1 - t) ** 3;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hasGL = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
  let calm = reducedMotion.matches || !hasGL || new URLSearchParams(location.search).has('calm');
  if (calm) document.documentElement.classList.add('calm');
  // If the paintings can't reach WebGL (opened from file://, lost context), show the stills instead of a frozen scene.
  function fallBackToCalm(err) {
    console.info('Showing the still version:', err && err.message);
    calm = true; stage = null;
    document.documentElement.classList.add('calm');
    measure();
    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
  }
  const isHorizontalGallery = () => !calm && innerWidth > 900 && innerWidth > innerHeight;

  /* ---------- Language ---------- */
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };
  let lang = new URLSearchParams(location.search).get('lang') || store.get('lang') || DATA.config.defaultLang;
  if (!DATA[lang]) lang = DATA.config.defaultLang;
  const t = key => key.split('.').reduce((o, k) => (o == null ? o : o[k]), DATA[lang]) ?? '';

  function renderRituals() {
    const track = $('#galleryTrack');
    $$('.ritual', track).forEach(n => n.remove());
    t('rituals.items').forEach((r, i) => {
      const el = document.createElement('article');
      el.className = 'ritual';
      el.innerHTML = `<img class="ritual__art" src="assets/art/m${i + 1}.png" alt="" width="760" height="967" loading="lazy" decoding="async">
        <div class="ritual__text"><p class="ritual__n"></p><h3 class="ritual__title"></h3><p class="ritual__desc"></p></div>`;
      $('.ritual__art', el).alt = r.alt;
      $('.ritual__n', el).textContent = r.n;
      $('.ritual__title', el).textContent = r.title;
      $('.ritual__desc', el).textContent = r.text;
      track.append(el);
    });
    observeRituals();
  }

  function applyLanguage(next, { refreshLayout = true } = {}) {
    lang = next;
    store.set('lang', lang);
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-alt]').forEach(el => { el.alt = t(el.dataset.i18nAlt); });
    $$('[data-i18n-label]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderRituals();
    syncRsvpCopy();
    if (refreshLayout) measure();
  }
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    // Keep the visitor where they are while text lengths change.
    const anchor = currentSection(); const offset = anchor ? anchor.getBoundingClientRect().top : 0;
    applyLanguage(b.dataset.lang);
    if (anchor) scrollTo({ top: scrollY + anchor.getBoundingClientRect().top - offset, behavior: 'instant' });
  }));

  /* ---------- WebGL stage: one camera through two paintings ---------- */
  const VS = `#version 300 es
  in vec2 p; uniform vec4 r; uniform vec2 res; out vec2 v;
  void main(){ v=p; vec2 s=r.xy+p*r.zw; gl_Position=vec4(s.x/res.x*2.-1.,1.-s.y/res.y*2.,0.,1.); }`;
  const FS = `#version 300 es
  precision highp float;
  in vec2 v; out vec4 o;
  uniform sampler2D T,W,L;
  uniform vec2 res,sun;
  uniform vec4 lmap;
  uniform float op,lod,time,mode,hz,sunU,lightP,dim,rad,fill,core;

  float n(vec2 x){ return fract(sin(dot(x,vec2(12.9898,78.233)))*43758.5453); }
  float vn(vec2 x){ vec2 i=floor(x),f=fract(x); f=f*f*(3.-2.*f);
    return mix(mix(n(i),n(i+vec2(1,0)),f.x),mix(n(i+vec2(0,1)),n(i+vec2(1,1)),f.x),f.y); }

  void main(){
    if(mode>4.5){ // the sun's light over the whole frame
      float d=length(gl_FragCoord.xy-vec2(sun.x,res.y-sun.y))/rad;
      float g=exp(-d*d*1.25), g2=exp(-d*.85)*.55;
      float a=clamp(g+g2*core+fill,0.,1.);
      vec3 c=mix(vec3(1.,.62,.26),vec3(1.,.93,.72),clamp(g*1.1+fill*.8,0.,1.));
      o=vec4(c*a,a); return;
    }
    vec2 uv=v; float w=0., d=0.;
    if(mode<1.5 && mode>.5){ // lake: horizon-based waves, cloud breath above
      d=(uv.y-hz)/(1.-hz); w=smoothstep(hz+.002,hz+.03,uv.y);
      float k=1.-smoothstep(hz-.14,hz-.02,uv.y);
      uv.x+=k*.0011*sin(uv.y*8.+time*.07+uv.x*3.);
      uv.y+=k*.0007*cos(uv.x*6.+time*.05);
    } else if(mode>1.5 && mode<2.5){ // lake inside the fort painting, from its mask
      vec2 m=vec2(uv.x,lmap.x+uv.y*lmap.y);
      w=texture(W,m).r; d=clamp((m.y-.57)/.2,0.,1.);
    } else if(mode>3.5){ // fort sky breathes
      uv.x+=.0012*sin(uv.y*7.+time*.06); uv.y+=.0006*cos(uv.x*5.+time*.05);
    }
    if(w>.001){
      float yp=1./(d+.09);
      float a=(.0007+.0042*d)*w;
      uv.x+=a*(sin(yp*9.+time*.8+uv.x*22.)+.6*sin(yp*23.-time*1.1+uv.x*47.));
      uv.y+=a*.5*sin(yp*14.+time*.6+uv.x*16.);
    }
    vec4 c=texture(T,uv,lod);
    if(w>.001 && mode<1.5){ // glints along the sun's road
      float col=exp(-pow((v.x-sunU)/(.012+.05*d),2.));
      float g=vn(vec2(v.x*150.,v.y*1100.)+vec2(time*.45,time*.25));
      c.rgb+=c.a*w*col*smoothstep(.72,.95,g)*vec3(.42,.27,.1);
      float s=vn(vec2(v.x*120.-time*.2,v.y*900.+time*.1));
      c.rgb+=c.a*w*smoothstep(.86,1.,s)*vec3(.09,.07,.05);
    }
    if(mode>2.5 && mode<3.5){ // fort: windows wake one by one, stone falls into dusk
      vec2 m=vec2(v.x,lmap.x+v.y*lmap.y);
      vec4 l=texture(L,m);
      float on=smoothstep(l.g,l.g+.05,lightP);
      float halo=texture(L,m,3.5).r;
      c.rgb*=mix(vec3(1.),vec3(.74,.66,.72),dim*(1.-l.r*on));
      c.rgb*=1.-l.r*(1.-on)*.62*c.a;
      c.rgb+=c.a*(l.r*on*vec3(.14,.08,.02)+halo*on*vec3(.2,.11,.03));
    } else if(mode>1.5 && mode<2.5){
      c.rgb*=mix(vec3(1.),vec3(.8,.72,.82),dim*.8);
    } else if(mode>3.5){
      c.rgb*=mix(vec3(1.),vec3(.93,.74,.76),dim);
    }
    o=c*op;
  }`;

  const ASSETS = {
    plate: 'lake-plate', statue: 'lake-statue', couple: 'lake-couple',
    sky: 'fort-sky', far: 'fort-far', near: 'fort-near', front: 'fort-front', lights: 'fort-lights', water: 'fort-water'
  };
  // Source pixel facts about the paintings
  const LAKE = { W: 2260, H: 1451, sunX: 1432, sunY: 657, hz: 757 / 1451, statue: { x: 588, y: 380, w: 340, h: 670, cx: 778 }, couple: { y: 760, h: 691, cx: 1093 } };
  const FORT = { W: 1536, H: 1024, sunX: 350, sunY: 288, ridge: 300, sky: { h: 640 }, far: { y: 150, h: 550 }, near: { y: 190, h: 834 }, front: { y: 290, h: 734 } };

  function createStage(canvas) {
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
    const U = {}; ['r', 'res', 'sun', 'lmap', 'op', 'lod', 'time', 'mode', 'hz', 'sunU', 'lightP', 'dim', 'rad', 'fill', 'core', 'T', 'W', 'L'].forEach(n => { U[n] = gl.getUniformLocation(prog, n); });
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(U.T, 0); gl.uniform1i(U.W, 1); gl.uniform1i(U.L, 2);

    const tex = {};
    const upload = (name, img) => {
      const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      const raw = name === 'lights' || name === 'water';
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !raw);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      tex[name] = tx;
    };
    const load = name => new Promise((res, rej) => {
      const i = new Image(); i.onerror = rej;
      // decode() can wait on a rendered frame, so it never gets to hold the layers back for long
      i.onload = () => { Promise.race([i.decode().catch(() => {}), new Promise(r => setTimeout(r, 350))]).then(() => { upload(name, i); res(); }); };
      i.src = `assets/scene/${ASSETS[name]}.webp`;
    });

    let W = 0, H = 0, DPR = 1, cap = 4;
    function resize(w, h) {
      DPR = Math.min(devicePixelRatio || 1, cap, w < 720 ? 1.5 : 1.75);
      W = w; H = h;
      canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.res, canvas.width, canvas.height);
    }
    function quad(name, x, y, w, h, o = {}) {
      if (!tex[name] || (o.op ?? 1) <= .002) return;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[name]);
      gl.uniform4f(U.r, x * DPR, y * DPR, w * DPR, h * DPR);
      gl.uniform1f(U.op, o.op ?? 1); gl.uniform1f(U.lod, o.lod ?? 0); gl.uniform1f(U.mode, o.mode ?? 0);
      if (o.lmap) gl.uniform4f(U.lmap, o.lmap[0], o.lmap[1], 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function light(x, y, rad, fill, core) {
      gl.uniform1f(U.mode, 5); gl.uniform4f(U.r, 0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.sun, x * DPR, y * DPR); gl.uniform1f(U.rad, Math.max(rad, 1) * DPR); gl.uniform1f(U.fill, fill); gl.uniform1f(U.core, core);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function frame(p, time, q) {
      gl.uniform1f(U.time, time);
      const aspect = W / H, P = clamp((aspect - .62) / (1.15 - .62));     // 0 = phone portrait, 1 = wide
      gl.clearColor(.91, .6, .3, 1); gl.clear(gl.COLOR_BUFFER_BIT);

      const lakeOn = p < .47;
      if (lakeOn) {
        const s = Math.max(H / LAKE.H, W / LAKE.W), V = W / s;
        const x0 = clamp(lerp(LAKE.sunX - .75 * V, (LAKE.W - V) / 2, P), 0, LAKE.W - V);
        const y0 = LAKE.H - H / s;
        const e = ease(seg(p, 0, .46));
        const Z = Math.pow(17, e * e * .55 + e * .45);                      // the camera eases forward, then commits
        const ax = lerp((LAKE.sunX - x0) * s, W * .5, ease(seg(p, .02, .34)));
        const ay = lerp((LAKE.sunY - y0) * s, H * .5, ease(seg(p, .02, .34)));
        const place = (px, py, pw, ph, k) => { const z = Math.pow(Z, k) * s; return [ax + (px - LAKE.sunX) * z, ay + (py - LAKE.sunY) * z, pw * z, ph * z]; };

        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex.water || null);
        gl.uniform1f(U.hz, LAKE.hz); gl.uniform1f(U.sunU, LAKE.sunX / LAKE.W);
        quad('plate', ...place(0, 0, LAKE.W, LAKE.H, 1), { mode: 1 });

        // Portrait: bring the statue into the frame rather than losing it
        const sdx = (x0 + .2 * V - LAKE.statue.cx) * (1 - P);
        quad('statue', ...place(LAKE.statue.x + sdx, LAKE.statue.y, LAKE.statue.w, LAKE.statue.h, 1.28), { op: 1 - seg(e, .62, .86), lod: seg(e, .3, .9) * 2.2 });

        // The couple stay on the shore: they drift out of focus as the viewer travels on
        const cs = lerp(.86, 1, P), cdx = (x0 + .53 * V - LAKE.couple.cx) * (1 - P);
        const cx = LAKE.couple.cx + cdx - LAKE.couple.cx * cs, cy = LAKE.H - LAKE.couple.h * cs;
        const focus = seg(p, .035, .22);
        const dropY = ease(seg(p, .02, .3)) * .32 * H;
        const c = place(cx, cy, LAKE.W * cs, LAKE.couple.h * cs, 1 + .55 * e);
        quad('couple', c[0], c[1] + dropY, c[2], c[3], { op: 1 - seg(p, .2, .3), lod: focus * focus * 4.2 });

        // Sun swells, then fills the frame
        const sunR = 30 * s * Z;
        const fill = ease(seg(p, .3, .44));
        light(ax, ay, Math.max(sunR * 2.4, 40), fill, .35 + seg(p, .1, .4) * .9);
      }
      if (p > .42) {
        const sL = Math.max(W / FORT.W, H / FORT.H), sP = W / 700, s = lerp(sP, sL, P), V = W / s;
        const x0 = clamp(lerp(232, (FORT.W - V) / 2 + 40, P), 0, Math.max(0, FORT.W - V));
        const y0 = FORT.H - H / s;
        const r = seg(p, .44, .68);
        
        const Z = lerp(1.26, 1, easeOut(r)) * (1 + q * .035);
        const sunSX = (FORT.sunX - x0) * s, sunSY = (FORT.ridge - y0) * s - 12 * s;
        const skyScale = Math.max(1, sunSY / (FORT.sunY * s));
        const place = (px, py, pw, ph, k = 1, yOff = 0) => { const z = 1 + (Z - 1) * k; return [sunSX + (px - FORT.sunX) * s * z, sunSY + (py - FORT.sunY) * s * z + yOff, pw * s * z, ph * s * z]; };
        const dim = seg(p, .62, .98) * .9;
        gl.uniform1f(U.lightP, seg(p, .68, .985)); gl.uniform1f(U.dim, dim);

        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex.water || null);
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tex.lights || null);

        const z = Z * skyScale;
        quad('sky', sunSX + (0 - FORT.sunX) * s * z, sunSY + (0 - FORT.sunY) * s * z, FORT.W * s * z, FORT.sky.h * s * z, { mode: 4 });
        const rise = t => 1 - easeOut(t);
        quad('far', ...place(0, FORT.far.y, FORT.W, FORT.far.h, .7, rise(seg(p, .47, .7)) * H * .07), { mode: 2, lmap: [FORT.far.y / FORT.H, FORT.far.h / FORT.H] });
        quad('near', ...place(0, FORT.near.y, FORT.W, FORT.near.h, .9, rise(seg(p, .49, .74)) * H * .15), { mode: 2, lmap: [FORT.near.y / FORT.H, FORT.near.h / FORT.H] });
        quad('front', ...place(0, FORT.front.y, FORT.W, FORT.front.h, 1.15, rise(seg(p, .52, .82)) * H * .3), { mode: 3, lmap: [FORT.front.y / FORT.H, FORT.front.h / FORT.H] });

        const fade = 1 - ease(seg(p, .44, .62));
        light(sunSX, sunSY, lerp(W * 1.1, 60 * s, easeOut(r)), fade, .5 + fade * .6);
      }
    }
    return { load, frame, resize, lowerQuality() { cap = 1; resize(W, H); } };
  }

  /* ---------- Scroll machinery: one rAF, one read of scroll per frame ---------- */
  const journey = $('#home'), openingText = $('#openingText'), hintEl = $('#hint'), fortTitle = $('#fortTitle'), birds = $('#birds');
  const world = $('#world'), wallBody = $('.wall__body'), nav = $('#nav');
  const gallerySection = $('#rituals'), galleryTrack = $('#galleryTrack'), lamps = $('#lamps');
  const routeMap = $('#routeMap'), routeLine = $('#routeLine'), facade = $('#facade');
  let stage = null, smooth = 0, vw = innerWidth, vh = innerHeight, galleryMax = 0, journeyMax = 1, journeyTop = 0, galleryTop = 0;
  const drifters = [];

  const riverImg = $('#reception .reception__art img:last-child');
  // The RSVP's river continues this painting at the same scale
  const syncRiver = () => $('#rsvp').style.setProperty('--river-w', `${riverImg.getBoundingClientRect().width}px`);
  riverImg.addEventListener('load', syncRiver);
  function measure() {
    vw = innerWidth; vh = innerHeight;
    syncRiver();
    journeyTop = journey.offsetTop;
    journeyMax = Math.max(1, journey.offsetHeight - vh);
    if (isHorizontalGallery()) {
      gallerySection.style.height = '';
      galleryMax = Math.max(0, galleryTrack.scrollWidth - vw);
      gallerySection.style.height = `${galleryMax + vh}px`;
    } else {
      gallerySection.style.height = ''; galleryTrack.style.transform = ''; galleryMax = 0;
    }
    galleryTop = gallerySection.getBoundingClientRect().top + scrollY;
    if (stage) stage.resize(vw, Math.max(vh, world.clientHeight));
    if (routeLine.getTotalLength) routeMap.style.setProperty('--len', routeLine.getTotalLength().toFixed(1));
  }

  let lastLamp = -1, lastNow = performance.now(), slowFrames = 0, sampled = 0;
  function tick(now) {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > vh * .25);
    nav.classList.toggle('is-past', y > journeyTop + journeyMax);

    /* Journey */
    const target = clamp((y - journeyTop) / journeyMax);
    const dt = Math.min(.1, (now - lastNow) * .001); lastNow = now;
    smooth += (target - smooth) * (1 - Math.exp(-dt * (Math.abs(target - smooth) > .2 ? 22 : 7)));   // same glide at any frame rate
    if (Math.abs(target - smooth) < .00005) smooth = target;
    const wallTop = wallBody.getBoundingClientRect().top;
    const inWorld = wallTop > -40;
    if (!calm) {
      world.classList.toggle('is-off', !inWorld);
      if (inWorld) {
        const q = seg(y, journeyTop + journeyMax, journeyTop + journeyMax + vh);
        if (stage) {
          stage.frame(smooth, now * .001, q);
          // Slow device: trade sharpness for smooth motion, once
          if (sampled < 60) { sampled++; if (dt > .04) slowFrames++; if (sampled === 60 && slowFrames > 30) stage.lowerQuality(); }
        }
        const open = 1 - seg(smooth, .035, .11);
        openingText.style.opacity = open.toFixed(3);
        openingText.style.transform = `translate3d(0,${(-smooth * 260).toFixed(1)}px,0)`;
        hintEl.style.opacity = (1 - seg(smooth, .008, .04)).toFixed(3);
        const ft = ease(seg(smooth, .79, .88));
        fortTitle.style.opacity = ft.toFixed(3);
        fortTitle.style.transform = `translate3d(0,${((1 - ft) * 16).toFixed(1)}px,0)`;
        const bp = seg(smooth, .6, 1);
        birds.style.opacity = (seg(smooth, .62, .7) * .85).toFixed(3);
        birds.style.transform = `translate3d(${(bp * -vw * .2 + Math.sin(now * .00035) * 8).toFixed(1)}px,${(Math.sin(now * .0006) * 5 - bp * 18).toFixed(1)}px,0)`;
      }
    }

    /* Ritual gallery walks sideways */
    if (galleryMax > 0) {
      const gp = clamp((y - galleryTop) / galleryMax);
      galleryTrack.style.transform = `translate3d(${(-gp * galleryMax).toFixed(1)}px,0,0)`;
      const lit = Math.floor(gp * 8.6 + .25);
      if (lit !== lastLamp) { $$('.lamp', lamps).forEach((l, i) => l.classList.toggle('is-on', i < lit)); lastLamp = lit; }
    }

    /* Slow architectural drift, only for what's on screen */
    for (const d of drifters) {
      if (!d.on) continue;
      const r = d.el.parentElement.getBoundingClientRect();
      const off = (r.top + r.height / 2 - vh / 2) * d.speed;
      d.el.style.translate = `0 ${off.toFixed(1)}px`;
    }

    /* The route draws itself */
    const rr = routeMap.getBoundingClientRect();
    if (rr.bottom > 0 && rr.top < vh) routeMap.style.setProperty('--p', ease(seg(vh - rr.top, vh * .2, rr.height + vh * .45)).toFixed(3));

    if (!calm) requestAnimationFrame(tick);
  }

  /* ---------- Things that switch on once ---------- */
  let ritualObserver = null;
  function observeRituals() {
    if (!ritualObserver) return;
    $$('.ritual').forEach(r => ritualObserver.observe(r));
  }
  function buildDecor() {
    $$('.winrow').forEach(row => { for (let i = 0; i < 7; i++) { const w = document.createElement('div'); w.className = 'win'; w.style.transitionDelay = `${i * .1}s`; row.append(w); } });
    for (let i = 0; i < 8; i++) { const l = document.createElement('div'); l.className = 'lamp'; lamps.append(l); }
  }
  function setupObservers() {
    const once = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); once.unobserve(e.target); } }), { threshold: .25 });
    $$('.rv').forEach(el => once.observe(el));

    ritualObserver = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); ritualObserver.unobserve(e.target); } }), { threshold: .2 });
    observeRituals();

    // Facade: the small windows wake first, then each home's jharokha
    const facadeIO = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      $$('.win', e.target).forEach((w, i) => setTimeout(() => w.classList.add('is-on'), calm ? 0 : 160 + (i * 613) % 1700));
      facadeIO.unobserve(e.target);
    }), { threshold: .12 });
    facadeIO.observe(facade);
    const houses = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-lit'); houses.unobserve(e.target); } }), { threshold: .45 });
    $$('.house').forEach(h => houses.observe(h));

    if (!calm) {
      const vis = new IntersectionObserver(es => es.forEach(e => { const d = drifters.find(x => x.el === e.target); if (d) d.on = e.isIntersecting; }), { rootMargin: '20% 0px' });
      $$('[data-drift]').forEach(el => { drifters.push({ el, speed: parseFloat(el.dataset.drift), on: false }); vis.observe(el); });
    }

    // Quietly mark where we are in the nav
    const links = $$('.nav__links a');
    const sections = links.map(a => $(a.getAttribute('href')));
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach((a, i) => { if (sections[i] === e.target) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }), { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }
  function currentSection() {
    const all = ['#home', '.wall', '#families', '#rituals', '.route', '#reception', '#rsvp'].map(s => $(s));
    return all.filter(s => s.getBoundingClientRect().top <= vh * .5).pop() || all[0];
  }

  /* ---------- Navigation ---------- */
  const menuBtn = $('#menuBtn');
  const setMenu = open => { nav.classList.toggle('is-open', open); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.textContent = t(open ? 'nav.close' : 'nav.menu'); };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  $$('.nav__links a, .skip').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); setMenu(false);
    const id = a.getAttribute('href'), el = $(id);
    let top = id === '#home' ? 0 : el.getBoundingClientRect().top + scrollY;
    if (id === '#wedding') top -= 90;
    // Long distances jump directly: the journey is for walking, not for rushing through
    scrollTo({ top, behavior: calm || Math.abs(top - scrollY) > vh * 1.5 ? 'instant' : 'smooth' });
    history.replaceState(null, '', id);
    if (id === '#wedding') el.focus({ preventScroll: true });
  }));

  /* ---------- RSVP ---------- */
  const finale = $('#rsvp'), lampBtn = $('#lampBtn'), replyBlock = $('#rsvpBlock'), chips = $$('.chip'), guestsRow = $('#guestsRow');
  const gDec = $('#gDec'), gInc = $('#gInc'), gCount = $('#gCount'), gName = $('#gName'), waLink = $('#waLink');
  const replyKeys = { both: 'rsvp.msgBoth', wed: 'rsvp.msgWed', rec: 'rsvp.msgRec', no: 'rsvp.msgNo' };
  let replyChoice = null, replyGuests = 2;
  function syncRsvpCopy() {
    const tel = DATA.config.phone, disp = DATA.config.phoneDisplay;
    const a = $('#telLink'); a.href = `tel:${tel}`; a.textContent = disp; a.setAttribute('dir', 'ltr');
    updateReply();
    menuBtn.textContent = t(nav.classList.contains('is-open') ? 'nav.close' : 'nav.menu');
  }
  function lightLamp(byGuest) {
    if (finale.classList.contains('is-lit')) return;
    finale.classList.add('is-lit');
    lampBtn.setAttribute('aria-expanded', 'true');
    replyBlock.hidden = false;
    if (!byGuest) return;
    // Bring all the options on screen as they appear
    setTimeout(() => replyBlock.scrollIntoView({ block: 'nearest', behavior: calm ? 'instant' : 'smooth' }), calm ? 0 : 650);
  }
  function replyMessage() {
    let text = t(replyKeys[replyChoice]).replace('{n}', replyGuests);
    if (lang === 'en') text = text.replace('guest(s)', replyGuests === 1 ? 'guest' : 'guests');
    const name = gName.value.trim();
    return name ? `${text}\n${t('rsvp.msgName').replace('{name}', name)}` : text;
  }
  function updateReply() {
    gCount.textContent = replyGuests;
    gDec.disabled = replyGuests <= 1; gInc.disabled = replyGuests >= 6;
    guestsRow.hidden = replyChoice === 'no';
    if (replyChoice) {
      waLink.href = `https://wa.me/${DATA.config.phone.replace(/\D/g, '')}?text=${encodeURIComponent(replyMessage())}`;
      waLink.setAttribute('aria-disabled', 'false');
    } else {
      waLink.removeAttribute('href');
      waLink.setAttribute('aria-disabled', 'true');
    }
  }
  function pickChip(chip, focus) {
    replyChoice = chip.dataset.opt;
    chips.forEach(c => { const on = c === chip; c.setAttribute('aria-checked', String(on)); c.tabIndex = on ? 0 : -1; });
    if (focus) chip.focus();
    updateReply();
  }
  lampBtn.addEventListener('click', () => lightLamp(true));
  chips.forEach((chip, i) => {
    chip.addEventListener('click', () => pickChip(chip));
    chip.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      pickChip(chips[(i + step + chips.length) % chips.length], true);
    });
  });
  gDec.addEventListener('click', () => { if (replyGuests > 1) { replyGuests--; updateReply(); } });
  gInc.addEventListener('click', () => { if (replyGuests < 6) { replyGuests++; updateReply(); } });
  gName.addEventListener('input', updateReply);
  waLink.addEventListener('click', () => {
    const endpoint = DATA.config.rsvpEndpoint;
    if (!endpoint || !replyChoice) return;
    const reply = { name: gName.value.trim(), choice: replyChoice, guests: replyChoice === 'no' ? 0 : replyGuests, lang };
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reply), keepalive: true }).catch(() => {});
  });
  if (reducedMotion.matches) lightLamp(false);

  /* ---------- Start ---------- */
  buildDecor();
  $('#mapWedding').href = DATA.config.maps.wedding;
  $('#mapReception').href = DATA.config.maps.reception;
  setupObservers();
  applyLanguage(lang, { refreshLayout: false });

  if (!calm) {
    try {
      const canvas = $('#stage');
      stage = createStage(canvas);
      const first = ['plate', 'statue', 'couple'].map(stage.load);
      const rest = () => Promise.all(['sky', 'far', 'near', 'front', 'lights', 'water'].map(stage.load));
      // Above-the-fold layers first, the fort as soon as they are in
      Promise.all(first).then(() => { canvas.classList.add('is-live'); return rest(); }).catch(fallBackToCalm);
    } catch (err) { fallBackToCalm(err); }
  }
  measure();
  let rt;
  addEventListener('resize', () => {
    // Ignore mobile address-bar height changes: they would make the art jump
    if (innerWidth === vw && Math.abs(innerHeight - vh) < 130) return;
    clearTimeout(rt); rt = setTimeout(measure, 120);
  });
  addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  requestAnimationFrame(tick);
  if (calm) addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });

  // Deep link to a section after layout has settled
  if (location.hash && location.hash !== '#home') { const el = $(location.hash); if (el) requestAnimationFrame(() => scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' })); }
})();
