/* ============================================================
   SCRIPT.JS — CINEMATIC PORTFOLIO ENGINE
   ============================================================ */
'use strict';

/* ── UTILITIES ──────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ── STATE ──────────────────────────────────────────────── */
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let trailX  = cursorX;
let trailY  = cursorY;
let activeProject = null;

/* ============================================================
   1. FILM GRAIN NOISE — GPU-BASED (no main-thread loop)
      Uses SVG feTurbulence filter + CSS animation.
      Zero CPU cost. Runs on the compositor thread.
   ============================================================ */
(function initNoise() {
  /* Hide the canvas — we use CSS grain instead */
  const canvas = $('#noise-canvas');
  if (canvas) canvas.style.display = 'none';

  /* Inject SVG filter definition */
  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('xmlns', svgNs);
  svg.style.cssText = 'position:absolute;width:0;height:0';
  svg.innerHTML = `
    <defs>
      <filter id="grain-filter" x="0%" y="0%" width="100%" height="100%"
              color-interpolation-filters="linearRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3"
                      stitchTiles="stitch" result="noise" />
        <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
        <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended"/>
        <feComposite in="blended" in2="SourceGraphic" operator="in"/>
      </filter>
    </defs>
  `;
  document.body.prepend(svg);

  /* Grain overlay div — animated via CSS keyframes (GPU) */
  const grain = document.createElement('div');
  grain.id = 'grain-overlay';
  grain.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9990;
    opacity: 0.045;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    animation: grain-shift 0.12s steps(1) infinite;
  `;
  document.body.appendChild(grain);

  /* Inject grain keyframes */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes grain-shift {
      0%  { background-position:   0%   0%; }
      10% { background-position: -5%  -10%; }
      20% { background-position: -15%   5%; }
      30% { background-position:  7%  -25%; }
      40% { background-position: -5%  25%; }
      50% { background-position: -15%  10%; }
      60% { background-position:  15%   0%; }
      70% { background-position:  0%  15%; }
      80% { background-position:  3%  35%; }
      90% { background-position: -10%  10%; }
    }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   1b. CINEMATIC 3D DRONE SHOT — THREE.JS SCENE
   Push-in from high altitude on a CatmullRom curve, with
   banking roll, starfield, animated dust, city grid below,
   light streaks, pillars, then ambient slow-orbit hover.
   ============================================================ */
(function initThreeHero() {
  if (typeof THREE === 'undefined') { console.warn('Three.js CDN failed to load'); return; }

  const heroEl = $('#hero');
  if (!heroEl) return;

  /* Hide the 2D canvas — Three.js owns the background now */
  const p2d = $('#hero-particles');
  if (p2d) p2d.style.display = 'none';

  /* ─── Renderer ──────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({
    antialias: true, alpha: false, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  Object.assign(renderer.domElement.style, {
    position: 'absolute', top: '0', left: '0',
    width: '100%', height: '100%',
    zIndex: '1', pointerEvents: 'none'
  });
  heroEl.insertBefore(renderer.domElement, heroEl.firstChild);

  /* ─── Scene & atmosphere fog ────────────────────────────── */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0026);

  /* ─── Perspective Camera ────────────────────────────────── */
  const camera = new THREE.PerspectiveCamera(
    58, window.innerWidth / window.innerHeight, 0.5, 2200
  );

  /* ─── Helper: create a Points mesh quickly ──────────────── */
  function makePoints(count, spreadX, spreadY, size, opacity, yOffset) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spreadX;
      pos[i * 3 + 1] = (Math.random() - 0.5) * (spreadY || spreadX);
      pos[i * 3 + 2] = (Math.random() - 0.5) * spreadX;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xffffff, size, sizeAttenuation: true,
      transparent: true, opacity
    }));
    if (yOffset) pts.position.y = yOffset;
    return pts;
  }

  /* ─── LAYER 1: Distant star sphere — 5000 pts ───────────── */
  (function buildStars() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 380 + Math.random() * 820;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xffffff, size: 1.0, sizeAttenuation: true,
      transparent: true, opacity: 0.72
    })));
  })();

  /* ─── LAYER 2: Animated dust — 900 particles w/ velocity ── */
  const DUST_COUNT = 900;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST_COUNT * 3);
  const dustVel = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT; i++) {
    dustPos[i * 3]     = (Math.random() - 0.5) * 500;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 260;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 500;
    dustVel[i * 3]     = (Math.random() - 0.5) * 0.004;
    dustVel[i * 3 + 1] = Math.random() * 0.007 + 0.001; /* always drift up */
    dustVel[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMesh = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.35, sizeAttenuation: true,
    transparent: true, opacity: 0.30
  }));
  scene.add(dustMesh);

  /* ─── LAYER 3: Mid-field particles (closer, larger) ─────── */
  scene.add(makePoints(380, 220, 110, 0.65, 0.16));

  /* ─── LAYER 4: City grid ground + light nodes ────────────── */
  (function buildGround() {
    const grid = new THREE.GridHelper(2200, 72, 0x141414, 0x0c0c0c);
    grid.position.y = -118;
    grid.material.transparent = true;
    grid.material.opacity = 0.52;
    scene.add(grid);

    /* Random city-light dots at grid level */
    const cityDots = makePoints(360, 1800, 0, 1.5, 0.24, -117);
    scene.add(cityDots);

    /* Faint ground glow disc */
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(300, 72),
      new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true,
        opacity: 0.01, side: THREE.DoubleSide
      })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -115;
    scene.add(disc);
  })();

  /* ─── LAYER 5: Horizontal light streaks ─────────────────── */
  (function buildStreaks() {
    for (let i = 0; i < 38; i++) {
      const w   = Math.random() * 150 + 30;
      const geo = new THREE.PlaneGeometry(w, 0.04 + Math.random() * 0.09);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true,
        opacity: 0.022 + Math.random() * 0.058, side: THREE.DoubleSide
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(
        (Math.random() - 0.5) * 700,
        (Math.random() - 0.5) * 210,
        (Math.random() - 0.5) * 700
      );
      m.rotation.y = Math.random() * Math.PI;
      m.rotation.x = (Math.random() - 0.5) * 0.09;
      scene.add(m);
    }
  })();

  /* ─── LAYER 6: Distant vertical pillars (skyscrapers) ────── */
  (function buildPillars() {
    for (let i = 0; i < 20; i++) {
      const h    = Math.random() * 100 + 25;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, h, 0.5),
        new THREE.MeshBasicMaterial({
          color: 0xffffff, transparent: true,
          opacity: 0.025 + Math.random() * 0.07
        })
      );
      const angle = Math.random() * Math.PI * 2;
      const dist  = 230 + Math.random() * 420;
      mesh.position.set(Math.cos(angle) * dist, -118 + h / 2, Math.sin(angle) * dist);
      scene.add(mesh);
    }
  })();

  /* ─── LAYER 7: Concentric scope rings at scene centre ────── */
  (function buildRings() {
    [[28, 28.6, 0.038], [46, 46.7, 0.024], [70, 70.8, 0.013]].forEach(([ri, ro, op]) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(ri, ro, 96),
        new THREE.MeshBasicMaterial({
          color: 0xffffff, transparent: true,
          opacity: op, side: THREE.DoubleSide
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 4;
      scene.add(ring);
    });
  })();

  /* ─── CAMERA PATH: CatmullRom drone push-in ─────────────── */
  /*
     Control points create a path that starts far/high,
     descends forward with a slight arc — like a cinema drone
     banking into its subject and settling in front of it.
  */
  const FLIGHT_CURVE = new THREE.CatmullRomCurve3([
    new THREE.Vector3( 118,  74, 345),   /* extreme altitude, far back */
    new THREE.Vector3(  82,  54, 278),   /* descending + forward */
    new THREE.Vector3(  48,  33, 208),   /* banking, approaching */
    new THREE.Vector3(  16,  15, 148),   /* near settle, levelling */
    new THREE.Vector3(   0,   6,  95),   /* final hover position */
  ], false, 'catmullrom', 0.5);

  const ENTRY_MS    = 6800;   /* full drone push-in time */
  const ORBIT_R     = 95;     /* radius after landing */
  const ORBIT_SPEED = 0.00015;/* rad/ms — 1 full orbit ≈ 12 min */
  const START_ROLL  = 0.14;   /* initial camera banking tilt */

  /* Exponential ease-out: snappy start, buttery settle */
  const easeOutExpo = t => (t >= 1) ? 1 : 1 - Math.pow(2, -10 * t);

  /* ─── Camera shake on name impact ───────────────────────── */
  let shakeEnd = 0, shakeAmp = 0;
  setTimeout(() => { shakeEnd = performance.now() + 230; shakeAmp = 0.50; }, 1250);
  setTimeout(() => { shakeEnd = performance.now() + 195; shakeAmp = 0.95; }, 1510);

  /* ─── Loop state ─────────────────────────────────────────── */
  let startT = null, lastT = null;
  let orbitStarted = false, orbitAngle = 0;
  let isActive = true;

  /* Initial camera placement */
  camera.position.copy(FLIGHT_CURVE.getPoint(0));
  camera.lookAt(new THREE.Vector3(0, 15, 0));

  /* ─── Main render loop ───────────────────────────────────── */
  function animate(now) {
    requestAnimationFrame(animate);
    if (!isActive) return;

    if (!startT) startT = now;
    const dt      = lastT ? Math.min(now - lastT, 50) : 16;
    lastT  = now;
    const elapsed = now - startT;

    /* Dust particle drift */
    for (let i = 0; i < DUST_COUNT * 3; i += 3) {
      dustPos[i]     += dustVel[i];
      dustPos[i + 1] += dustVel[i + 1];
      dustPos[i + 2] += dustVel[i + 2];
      if (dustPos[i + 1] > 130) {         /* respawn at bottom */
        dustPos[i + 1] = -130;
        dustPos[i]     = (Math.random() - 0.5) * 500;
        dustPos[i + 2] = (Math.random() - 0.5) * 500;
      }
    }
    dustGeo.attributes.position.needsUpdate = true;

    /* Slow universe rotation (stars drift subtly) */
    scene.rotation.y = elapsed * 0.000013;

    /* ── Phase 1: Cinematic drone push-in ── */
    if (elapsed < ENTRY_MS) {
      const t  = easeOutExpo(Math.min(elapsed / ENTRY_MS, 1));
      const pt = FLIGHT_CURVE.getPoint(t);

      camera.position.lerp(pt, 0.052);
      camera.lookAt(new THREE.Vector3(0, THREE.MathUtils.lerp(15, 0, t), 0));

      /* Banking roll: levels out as drone settles */
      camera.rotation.z = THREE.MathUtils.lerp(START_ROLL, 0, easeOutExpo(t * 1.5));

    } else {
      /* ── Phase 2: Gentle ambient hover orbit ── */
      if (!orbitStarted) {
        orbitStarted = true;
        orbitAngle = Math.atan2(camera.position.x, camera.position.z);
      }
      orbitAngle += ORBIT_SPEED * dt;

      const tx = Math.sin(orbitAngle) * ORBIT_R;
      const tz = Math.cos(orbitAngle) * ORBIT_R;
      const ty = 6 + Math.sin(elapsed * 0.00022) * 4; /* gentle altitude drift */

      camera.position.lerp(new THREE.Vector3(tx, ty, tz), 0.007);
      camera.lookAt(0, 0, 0);
      camera.rotation.z = 0;
    }

    /* ── Camera shake on title impact ── */
    if (now < shakeEnd) {
      const decay = (shakeEnd - now) / 220;
      camera.position.x += (Math.random() - 0.5) * shakeAmp * decay;
      camera.position.y += (Math.random() - 0.5) * shakeAmp * decay * 0.5;
    }

    renderer.render(scene, camera);
  }

  animate(performance.now());

  /* ─── Pause render when hero leaves viewport ─────────────── */
  new IntersectionObserver(([e]) => { isActive = e.isIntersecting; }, { threshold: 0 })
    .observe(heroEl);

  /* ─── Resize handler ─────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();

/* ============================================================
   2. CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
  const dot   = $('#custom-cursor');
  const trail = $('#cursor-trail');

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    dot.style.left = cursorX + 'px';
    dot.style.top  = cursorY + 'px';
  });

  function animateTrail() {
    trailX = lerp(trailX, cursorX, 0.14);
    trailY = lerp(trailY, cursorY, 0.14);
    trail.style.left = trailX + 'px';
    trail.style.top  = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  /* Hover detection */
  const hoverEls = 'a, button, .project-row, .skill-block, .contact-btn, .nav-logo';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverEls)) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverEls)) {
      document.body.classList.remove('cursor-hover');
    }
  });
})();

/* ============================================================
   3. SCROLL PROGRESS BAR
   ============================================================ */
(function initScrollProgress() {
  const bar = $('#scroll-progress');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.width = (pct * 100) + '%';
  }, { passive: true });
})();

/* ============================================================
   4. CINEMATIC HERO — ORCHESTRATION ENGINE
   ============================================================ */
(function initCinematicHero() {

  const hero       = $('#hero');
  const w1         = $('#cn-w1');
  const w2         = $('#cn-w2');
  const nameWrap   = $('#cinema-name-wrap');
  const speedlines = $('#speedlines');
  const chroma     = $('#chroma-layer');
  const tlWords    = [1,2,3,4,5].map(i => $(`#tl-w${i}`));
  const gateBtn    = $('#gate-btn');
  const canvas     = $('#hero-particles');

  /* ── Particle dust field ─────────────────────────────── */
  (function initParticles() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function spawnParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(Math.random() * 0.25 + 0.05),
        opacity: Math.random() * 0.35 + 0.05,
        life: 1,
        decay: Math.random() * 0.0008 + 0.0003
      };
    }

    for (let i = 0; i < 120; i++) particles.push(spawnParticle());

    function tick() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p, i) => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.life -= p.decay;
        if (p.life <= 0 || p.y < -10) particles[i] = spawnParticle();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity * p.life})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener('resize', resize);
  })();

  /* ── Speed-line burst helper ─────────────────────────── */
  function triggerSpeedLines() {
    speedlines.classList.remove('flash');
    void speedlines.offsetWidth; /* reflow */
    speedlines.classList.add('flash');
    setTimeout(() => speedlines.classList.remove('flash'), 500);
  }

  /* ── Chromatic aberration burst helper ───────────────── */
  function triggerChroma() {
    nameWrap.classList.remove('glitch');
    chroma.classList.remove('burst');
    void nameWrap.offsetWidth;
    nameWrap.classList.add('glitch');
    chroma.classList.add('burst');
    setTimeout(() => {
      nameWrap.classList.remove('glitch');
      chroma.classList.remove('burst');
    }, 350);
  }

  /* ── Main orchestrated timeline ──────────────────────── */
  function runTimeline() {
    /* T=0: fire speed-lines */
    triggerSpeedLines();

    /* T=200ms: activate hero (opens letterbox, shows pretitle) */
    setTimeout(() => {
      hero.classList.add('cinema-active');
    }, 200);

    /* T=900ms: first name word drops in */
    setTimeout(() => {
      if (w1) w1.classList.add('in');
    }, 900);

    /* T=1150ms: second word slams + chroma burst */
    setTimeout(() => {
      if (w2) w2.classList.add('in');
      setTimeout(triggerChroma, 80);
    }, 1150);

    /* T=2700ms: tagline words burn in sequentially */
    tlWords.forEach((el, i) => {
      setTimeout(() => {
        if (el) el.classList.add('burn');
      }, 2700 + i * 160);
    });

    /* T=5s: periodic glitch recurrence every 7s */
    setTimeout(() => {
      setInterval(triggerChroma, 7000);
    }, 5000);
  }

  /* Small delay to let flash-overlay clear first */
  setTimeout(runTimeline, 300);

  /* ── Gate button: scroll to next section ─────────────── */
  if (gateBtn) {
    gateBtn.addEventListener('click', () => {
      const about = $('#about');
      if (about) about.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ── Parallax: subtle name scale on scroll ───────────── */
  const stage = $('#cinema-stage');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight || !stage) return;
    const pct = y / window.innerHeight;
    stage.style.transform = `scale(${1 + pct * 0.04}) translateY(${pct * -30}px)`;
    stage.style.opacity   = (1 - pct * 1.8).toString();
  }, { passive: true });

})();


/* ============================================================
   5. INTERSECTION OBSERVER — SCROLL-TRIGGERED SLAMS
   ============================================================ */
(function initScrollAnimations() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;

      /* Title card lines — staggered slam */
      if (target.classList.contains('tc-line')) {
        const delay = parseInt(target.dataset.delay || '0');
        setTimeout(() => target.classList.add('in-view'), delay);
        return;
      }

      /* About body, skill blocks, esc lines, contact elements */
      if (target.classList.contains('skill-block')) {
        const blocks = $$('.skill-block');
        const idx = blocks.indexOf(target);
        setTimeout(() => target.classList.add('in-view'), idx * 80);
        return;
      }

      if (target.classList.contains('esc-line')) {
        target.classList.add('in-view');
        return;
      }

      target.classList.add('in-view');
    });
  }, { threshold: 0.15 });

  /* Observe all animated elements */
  $$(`.tc-line, .about-body, .skill-block, .esc-line,
      .contact-pre, .contact-cta, .contact-links, .contact-footer`).forEach(el => io.observe(el));
})();

/* ============================================================
   6. PROJECT HOVER SIZZLE + PREVIEW
   ============================================================ */
(function initProjectHover() {
  const preview    = $('#hover-preview');
  const previewImg = $('#preview-img');
  const rows       = $$('.project-row');

  /* Move preview with cursor */
  document.addEventListener('mousemove', (e) => {
    const offsetX = e.clientX > window.innerWidth / 2 ? -430 : 30;
    const offsetY = -120;
    preview.style.left = (e.clientX + offsetX) + 'px';
    preview.style.top  = (e.clientY + offsetY) + 'px';
  });

  rows.forEach(row => {
    const imgSrc = row.dataset.img;

    row.addEventListener('mouseenter', () => {
      previewImg.src = imgSrc;
      preview.classList.add('visible');
      triggerRowFlash(row);
    });

    row.addEventListener('mouseleave', () => {
      preview.classList.remove('visible');
    });
  });

  /* Brief flash on hover enter */
  function triggerRowFlash(row) {
    row.style.background = 'rgba(255,255,255,0.06)';
    setTimeout(() => { row.style.background = ''; }, 80);
  }
})();

/* ============================================================
   7. PROJECT DETAIL — BLADE CUT OPEN / CLOSE
   ============================================================ */
const projectData = {
  'proj-nexus': {
    num: '01', title: 'NEXUS AI',
    tags: 'AI · ANALYTICS · FULL STACK',
    desc: 'A real-time AI-powered analytics engine that processes millions of data points to surface actionable intelligence. Built with a distributed microservices architecture for extreme scale and resilience.',
    stack: 'React · Node.js · Python · PostgreSQL · Redis · AWS Lambda',
    img: 'project_nexus.png'
  },
  'proj-vault': {
    num: '02', title: 'VAULT',
    tags: 'MOBILE · E-COMMERCE · UX',
    desc: 'A frictionless mobile commerce experience that turned a checkout flow into an art form. 3× conversion lift by stripping every unnecessary step and obsessing over micro-interactions.',
    stack: 'React Native · Node.js · Stripe · MongoDB · Firebase',
    img: 'project_vault.png'
  },
  'proj-forge': {
    num: '03', title: 'FORGE',
    tags: 'SAAS · DEVTOOLS · BACKEND',
    desc: 'A developer productivity platform that unifies CI/CD pipelines, infrastructure management, and real-time log streaming in one terminal-forward interface.',
    stack: 'Next.js · Go · Docker · Kubernetes · PostgreSQL · Terraform',
    img: 'project_forge.png'
  },
  'proj-signal': {
    num: '04', title: 'SIGNAL',
    tags: 'ANALYTICS · REAL-TIME · API',
    desc: 'A high-throughput social analytics platform delivering real-time engagement metrics, trend detection, and competitive intelligence across 12+ platforms simultaneously.',
    stack: 'TypeScript · GraphQL · Redis · Kafka · Elasticsearch · AWS',
    img: 'project_signal.png'
  }
};

(function initProjectDetail() {
  const overlay    = $('#project-detail');
  const closeBtn   = $('#detail-close');
  const rows       = $$('.project-row');

  rows.forEach(row => {
    row.addEventListener('click', () => openDetail(row.id));
  });

  closeBtn.addEventListener('click', closeDetail);

  /* ESC key to close */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeDetail();
  });

  function openDetail(id) {
    const data = projectData[id];
    if (!data) return;

    activeProject = id;

    /* Populate content */
    $('#detail-num').textContent   = data.num;
    $('#detail-title').textContent = data.title;
    $('#detail-tags').textContent  = data.tags;
    $('#detail-desc').textContent  = data.desc;
    $('#detail-stack').textContent = data.stack;
    $('#detail-img').src           = data.img;
    $('#detail-img').alt           = data.title;

    /* Blade-cut animation: white flash sweep then reveal */
    const blade = $(`#blade-${id.replace('proj-', '')}`);
    if (blade) {
      blade.style.transition = 'transform 0.35s cubic-bezier(0.87, 0, 0.13, 1)';
      blade.style.transform  = 'scaleX(1)';
    }

    setTimeout(() => {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (blade) {
        blade.style.transition = 'none';
        blade.style.transform  = 'scaleX(0)';
      }
    }, 300);
  }

  function closeDetail() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    activeProject = null;
  }
})();

/* ============================================================
   8. KINETIC TYPOGRAPHY — SCROLL SPEED REACTIONS
   ============================================================ */
(function initKineticType() {
  let lastY = window.scrollY;
  let scrollV = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    scrollV = currentY - lastY;
    lastY = currentY;

    if (!ticking) {
      requestAnimationFrame(() => {
        applyKinetics(scrollV);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  function applyKinetics(v) {
    const speed = clamp(Math.abs(v), 0, 60);
    const skewAmt = (v / 60) * 3.5; /* max 3.5deg skew */

    /* Only skew elements whose transforms are fully controlled here.
       tc-line and esc-line use translateX for their reveal, skip them. */
    $$('.proj-title, .hero-name').forEach(el => {
      el.style.transform = `skewX(${skewAmt}deg)`;
      el.style.transition = speed > 5
        ? 'transform 0.05s linear'
        : 'transform 0.4s cubic-bezier(0.19,1,0.22,1)';
    });
  }
})();

/* ============================================================
   9. ESCALATION SECTION — PARALLAX DEPTH
   ============================================================ */
(function initEscalation() {
  const escSection = $('#escalation');
  const lines = $$('.esc-line');

  function onScroll() {
    const rect = escSection.getBoundingClientRect();
    const center = rect.top + rect.height / 2 - window.innerHeight / 2;
    const progress = clamp(-center / (window.innerHeight * 0.8), -1, 1);

    lines.forEach((line, i) => {
      const offset = (i + 1) * 0.15 * progress * -30;
      line.style.transform = line.classList.contains('in-view')
        ? `translateX(${offset}px)`
        : `translateX(-60px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ============================================================
   10. CONTACT SECTION — CURSOR MAGNETIC
   ============================================================ */
(function initMagneticButtons() {
  const btns = $$('.contact-btn, .detail-cta');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ============================================================
   11. NAV SCROLL BEHAVIOR
   ============================================================ */
(function initNav() {
  const nav = $('#main-nav');
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.style.mixBlendMode = y > 80 ? 'normal' : 'difference';
    nav.style.background = y > 80 ? 'rgba(0,0,0,0.9)' : 'transparent';
    nav.style.backdropFilter = y > 80 ? 'blur(10px)' : 'none';
    nav.style.borderBottom = y > 80 ? '1px solid rgba(255,255,255,0.06)' : 'none';
    lastY = y;
  }, { passive: true });

  /* Smooth nav link scroll */
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   12. RAPID FLASH — SECTION TRANSITIONS
   ============================================================ */
(function initSectionFlash() {
  const sections = $$('.panel');
  let lastSection = null;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting && target !== lastSection) {
        if (lastSection) flashTransition();
        lastSection = target;
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => io.observe(s));

  function flashTransition() {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position:fixed; inset:0; background:rgba(255,255,255,0.07);
      z-index:9998; pointer-events:none;
      animation: quick-flash 0.15s ease forwards;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 200);
  }

  /* Inject keyframe */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes quick-flash {
      0%   { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();


/* (Hero parallax now handled inside initCinematicHero above) */


/* ============================================================
   14. SKILLS TICKER — SPEED UP ON SCROLL
   ============================================================ */
(function initTickerSpeed() {
  const ticker = $('#skills-ticker');
  let baseSpeed = 25;
  let currentSpeed = baseSpeed;
  let targetSpeed = baseSpeed;

  window.addEventListener('scroll', () => {
    const scrollSpeed = Math.abs(window.scrollY - (window._prevScrollY || 0));
    window._prevScrollY = window.scrollY;
    targetSpeed = Math.max(5, baseSpeed - scrollSpeed * 0.5);
  }, { passive: true });

  function updateTicker() {
    currentSpeed = lerp(currentSpeed, targetSpeed, 0.05);
    ticker.style.animationDuration = currentSpeed + 's';
    requestAnimationFrame(updateTicker);
  }
  updateTicker();
})();

/* ============================================================
   15. CONTACT SECTION — LETTER-BY-LETTER REVEAL
   ============================================================ */
(function initContactReveal() {
  const ctaEl = $('#contact-cta');
  if (!ctaEl) return;

  /* Read the text lines from the <br> structure without using innerHTML split
     (innerHTML normalises <br/> to <br> and splitting is fragile).
     Strategy: grab each text word as an array using innerText split by newline. */
  const rawLines = ctaEl.innerText.trim().split('\n').map(l => l.trim()).filter(Boolean);

  /* Re-build the element with individual letter spans */
  ctaEl.innerHTML = rawLines.map((line, li) => {
    const letterSpans = line.split('').map(c =>
      `<span class="cta-char" style="display:inline-block;opacity:0;transform:translateY(50px)">${c === ' ' ? '&nbsp;' : c}</span>`
    ).join('');
    return `<span class="cta-line" style="display:block">${letterSpans}</span>`;
  }).join('');

  const style = document.createElement('style');
  style.textContent = `
    .cta-char {
      transition: opacity 0.45s cubic-bezier(0.19,1,0.22,1),
                  transform 0.45s cubic-bezier(0.19,1,0.22,1);
    }
  `;
  document.head.appendChild(style);

  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;

    const chars = $$('.cta-char', ctaEl);
    chars.forEach((ch, i) => {
      setTimeout(() => {
        ch.style.opacity   = '1';
        ch.style.transform = 'translateY(0)';
      }, i * 35);
    });

    io.disconnect();
  }, { threshold: 0.2 });

  io.observe(ctaEl);
})();

/* ============================================================
   16. PERFORMANCE — PAUSE ANIMATIONS WHEN TAB HIDDEN
   ============================================================ */
document.addEventListener('visibilitychange', () => {
  document.body.style.animationPlayState =
    document.hidden ? 'paused' : 'running';
});

/* ── INIT COMPLETE ──────────────────────────────────────── */
console.log('%c⚡ CINEMATIC PORTFOLIO LOADED', 'font-size:1.2rem;font-weight:900;color:#fff;background:#000;padding:8px 16px;');
