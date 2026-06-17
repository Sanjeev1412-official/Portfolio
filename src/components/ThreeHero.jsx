import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { useScrollProgress, PhysicsStore } from '../hooks/ScrollContext';

// ─── TUNING ────────────────────────────────────────────────────────────────
const JOURNEY_DEPTH  = 40000; // SHORT — every scroll tick = huge perceived movement
const HOME_Z         =     0; // Camera rests here after intro
const INTRO_START_Z  =  9000; // Drone starts 9000 units back and FLIES through particles
const INTRO_DURATION =   4.75; // Stops exactly when "YOUR NAME" slams on screen
// ─────────────────────────────────────────────────────────────────────────────

// Smooth ease with perfectly smooth stop at end
function introEase(t) {
  if (t < 0.08) return t * t * 40;                             // cold start
  if (t < 0.65) { const u=(t-0.08)/0.57; return 0.256+0.6*(1-Math.pow(1-u,2)); } // acceleration
  const u = (t - 0.65) / 0.35;
  const ease = 1 - Math.pow(1 - u, 4);
  return 0.856 + 0.144 * ease; // Perfectly smooth, complete stop (no bounce)
}

// Spring damper — makes motion feel physically real
function springStep(curr, vel, target, k, d, dt) {
  const f   = (target - curr) * k;
  const newV = (vel + f * dt) * Math.pow(d, dt * 60);
  return { pos: curr + newV * dt, vel: newV };
}

export default function ThreeHero() {
  const containerRef = useRef(null);
  const { progress }  = useScrollProgress();
  const progressRef   = useRef(0);

  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    if (!containerRef.current) return;

    // ── RENDERER ─────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    Object.assign(renderer.domElement.style, {
      position:'absolute', top:'0', left:'0',
      width:'100%', height:'100%', zIndex:'1', pointerEvents:'none',
    });
    containerRef.current.appendChild(renderer.domElement);

    // ── SCENE & CAMERA ───────────────────────────────────
    const scene  = new THREE.Scene();
    // Narrow FOV = tighter tunnel feel, stars feel bigger/closer
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200000);
    camera.position.set(0, 0, INTRO_START_Z);

    // ── BLOOM ────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.2,   // strength  — dramatic glowing stars
      1.2,   // radius    — huge halo = cinematic lens optics
      0.30   // threshold — even dim particles bloom
    );
    composer.addPass(bloomPass);

    // ── MINIMAL LIGHTING ────────────────────────────────
    scene.add(new THREE.AmbientLight(0x000000, 1)); // Pure dark space

    // ── TEXTURE HELPER ───────────────────────────────────
    const mkTex = (sz, fn) => {
      const c = document.createElement('canvas'); c.width = c.height = sz;
      fn(c.getContext('2d'), sz); return new THREE.CanvasTexture(c);
    };

    // Crisp bright star sprite
    const starTex = mkTex(64, (ctx, s) => {
      const g = ctx.createRadialGradient(s/2,s/2,0, s/2,s/2,s/2);
      g.addColorStop(0,    'rgba(255,255,255,1)');
      g.addColorStop(0.05, 'rgba(255,255,255,1)');
      g.addColorStop(0.2,  'rgba(200,215,255,0.6)');
      g.addColorStop(0.5,  'rgba(120,150,255,0.15)');
      g.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
    });

    const mkPtsMat = (size, opacity, sizeAtten = true) => new THREE.PointsMaterial({
      size, map: starTex, vertexColors: true,
      transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
      sizeAttenuation: sizeAtten,
    });

    // ── PARTICLE BUILDER ─────────────────────────────────
    const build = (count, posFn, colFn) => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const tmp = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const p = posFn(i);
        pos[i*3]=p[0]; pos[i*3+1]=p[1]; pos[i*3+2]=p[2];
        const c = colFn(i, tmp);
        col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
      return geo;
    };

    const SPECTRAL = [0x9bb0ff,0xcad7ff,0xffffff,0xfff4ea,0xffd2a1,0xffcc6f];
    const rndCol = (tmp, palette) => {
      tmp.setHex(palette[Math.floor(Math.random()*palette.length)]);
      const br = 0.3 + Math.random() * 0.7;
      return [tmp.r*br, tmp.g*br, tmp.b*br];
    };

    // ════════════════════════════════════════════════════════
    // PARTICLE UNIVERSE
    // ════════════════════════════════════════════════════════

    // ── 1. BACKGROUND COSMOS — 40k stars on far sphere ───
    // These are pure backdrop — they give depth reference
    {
      const geo = build(40000,
        () => {
          const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
          const r=80000+Math.random()*50000;
          return [r*Math.sin(ph)*Math.cos(th), r*Math.sin(ph)*Math.sin(th), r*Math.cos(ph)];
        },
        (_, tmp) => rndCol(tmp, SPECTRAL)
      );
      scene.add(new THREE.Points(geo, mkPtsMat(9, 0.95)));
    }

    // ── 2. MID-FIELD — 20k stars closer in ───────────────
    {
      const geo = build(20000,
        () => {
          const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
          const r=20000+Math.random()*60000;
          return [r*Math.sin(ph)*Math.cos(th), r*Math.sin(ph)*Math.sin(th), r*Math.cos(ph)];
        },
        (_, tmp) => rndCol(tmp, SPECTRAL)
      );
      scene.add(new THREE.Points(geo, mkPtsMat(6, 0.8)));
    }

    // ── 3. REALISTIC OPEN SPACE VOLUME ───────────────────
    // Instead of an artificial tunnel, stars are scattered realistically 
    // across a massive open volume (X, Y, Z). No clustering in the center.
    const VOL_Z_START = INTRO_START_Z + 2000;
    const VOL_Z_END   = -JOURNEY_DEPTH - 4000;
    const VOL_Z_RANGE = VOL_Z_START - VOL_Z_END;

    {
      // 3/4 OF PARTICLES: Tiny, dim, non-glowing cosmic dust (300,000 particles)
      const geo = build(300000,
        () => {
          // Tighter volume so particles are dense and visible in the camera's FOV
          const x = (Math.random() - 0.5) * 60000;
          const y = (Math.random() - 0.5) * 3500;
          const z = VOL_Z_START - Math.random() * VOL_Z_RANGE;
          return [x, y, z];
        },
        (_, tmp) => {
          const colors = [0x334455, 0x443344, 0x223344];
          tmp.setHex(colors[Math.floor(Math.random() * colors.length)]);
          const br = 0.08 + Math.random() * 0.12; 
          return [tmp.r*br, tmp.g*br, tmp.b*br];
        }
      );
      // Increased size so they are actually visible
      scene.add(new THREE.Points(geo, mkPtsMat(6.0, 0.55)));
    }

    {
      // 1/4 OF PARTICLES: Bright glowing stars (100,000 particles)
      const geo = build(1000,
        () => {
          const x = (Math.random() - 0.5) * 6000;
          const y = (Math.random() - 0.5) * 3500;
          const z = VOL_Z_START - Math.random() * VOL_Z_RANGE;
          return [x, y, z];
        },
        (_, tmp) => rndCol(tmp, SPECTRAL)
      );
      // Massive size for glowing stars so they pop
      scene.add(new THREE.Points(geo, mkPtsMat(14.0, 1.0)));
    }

    // ── 4. RARE BRIGHT STARS ─────────────────────────────
    // Completely randomly scattered bright stars for speed reference
    {
      const geo = build(8000,
        () => {
          const x = (Math.random() - 0.5) * 5000;
          const y = (Math.random() - 0.5) * 3000;
          const z = VOL_Z_START - Math.random() * VOL_Z_RANGE;
          return [x, y, z];
        },
        (_, tmp) => {
          const bright = [0xffffff, 0xfff5e0, 0xe0eeff];
          return rndCol(tmp, bright);
        }
      );
      scene.add(new THREE.Points(geo, mkPtsMat(20.0, 1.0)));
    }

    // ── 5. NEBULA COLOR WASH ─────────────────────────────
    [
      { col:[0x1133cc,0x2244dd], z:-1500, spread:5000, count:30000 },
      { col:[0xaa2200,0xcc3300], z:-5500, spread:6000, count:35000 },
      { col:[0x0088cc,0x0066aa], z:-9000, spread:5000, count:28000 },
    ].forEach(({ col, z, spread, count }) => {
      const geo = build(count,
        () => [
          (Math.random()-0.5)*spread*2,
          (Math.random()-0.5)*spread*0.6,
          z + (Math.random()-0.5)*spread
        ],
        (_, tmp) => { tmp.setHex(col[Math.floor(Math.random()*col.length)]); const br=0.12+Math.random()*0.35; return [tmp.r*br,tmp.g*br,tmp.b*br]; }
      );
      scene.add(new THREE.Points(geo, mkPtsMat(10, 0.25)));
    });

    // ── 6. CLOSE FLY-PAST PARTICLES ───────────────────────
    // These particles are concentrated close to the center axis (X: -1200 to 1200, Y: -800 to 800)
    // so they fly directly past the camera lens during scroll, creating a highly immersive 3D depth sensation.
    // They dynamically fade in and out so they only glow when close to the camera, avoiding a concentrated glow at the far horizon.
    const closeParticlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        cameraZ: { value: INTRO_START_Z },
        pointTexture: { value: starTex },
      },
      vertexShader: `
        uniform float cameraZ;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          float distZ = abs(position.z - cameraZ);
          
          // Smooth zone of visibility: fade out beyond 3500 units, fade out within 150 units to prevent clipping
          float fadeFar = 1.0 - smoothstep(2200.0, 3500.0, distZ);
          float fadeNear = smoothstep(120.0, 300.0, distZ);
          float fade = fadeFar * fadeNear;
          vAlpha = fade * 0.85;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 15.0 * (300.0 / -mvPosition.z) * fade;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    {
      const geo = build(10000,
        () => {
          const x = (Math.random() - 0.5) * 2400;
          const y = (Math.random() - 0.5) * 1600;
          const z = VOL_Z_START - Math.random() * VOL_Z_RANGE;
          return [x, y, z];
        },
        (_, tmp) => {
          const colors = [0xd6eaff, 0xffffff, 0xbfe3ff, 0x8cc8ff];
          tmp.setHex(colors[Math.floor(Math.random() * colors.length)]);
          const br = 0.6 + Math.random() * 0.4;
          return [tmp.r * br, tmp.g * br, tmp.b * br];
        }
      );
      scene.add(new THREE.Points(geo, closeParticlesMaterial));
    }

    // ════════════════════════════════════════════════════════
    // CAMERA STATE — Spring-physics drone
    // ════════════════════════════════════════════════════════
    const cam = {
      px: {pos:0,  vel:0}, py: {pos:0,   vel:0},
      pz: {pos:INTRO_START_Z, vel:0},
      lx: {pos:0,  vel:0}, ly: {pos:0,   vel:0},
      roll: {pos:0,vel:0},
    };

    let animId;
    let lastNow = performance.now();
    const t0    = performance.now();
    let prevP   = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now     = performance.now();
      const dt      = Math.min((now - lastNow) * 0.001, 0.033);
      lastNow       = now;
      const elapsed = (now - t0) * 0.001;

      // ─── SMOOTH SCROLL ─────────────────────────────────
      // Use global PhysicsStore to guarantee 100% perfect sync with HTML components
      const sp = PhysicsStore.sp;
      const scrollVel = Math.abs(sp - prevP) / dt;
      prevP = sp;

      // ─── PHASE ─────────────────────────────────────────
      const introT  = Math.min(elapsed / INTRO_DURATION, 1.0);
      const inIntro = introT < 1.0;

      // ─── TARGET POSITION ────────────────────────────────
      let tX, tY, tZ;

      if (inIntro) {
        const eased = introEase(introT);
        tZ = INTRO_START_Z - eased * (INTRO_START_Z - HOME_Z);

        const decay    = 1 - introT;
        const arcX     = Math.sin(introT * Math.PI * 1.2) * 800 * decay;
        const arcY     = Math.cos(introT * Math.PI * 0.8) * 400 * decay;
        
        // Zero drift during intro so it stops dead center when the text appears
        tX = arcX;
        tY = arcY;
      } else {
        let baseZ = sp * JOURNEY_DEPTH;
        
        // ── SYNC BACKGROUND TO DEADZONES ──
        // Pause the 3D starfield exactly when the UI timelines pause on screen
        let bgZ = baseZ;
        if (baseZ <= 5000) {
           bgZ = baseZ;                               // Hero → Journey entry
        } else if (baseZ <= 7000) {                   // Journey dwell
           bgZ = 5000;
        } else if (baseZ <= 10000) {                  // Journey exit / TechStack entry
           bgZ = 5000 + (baseZ - 7000);               // 5000 → 8000
        } else if (baseZ <= 12000) {                  // TechStack dwell
           bgZ = 8000;
        } else if (baseZ <= 18000) {                  // TechStack exit / Projects entry
           bgZ = 8000 + (baseZ - 12000);              // 8000 → 14000
        } else if (baseZ <= 21000) {                  // Projects dwell
           bgZ = 14000;
        } else if (baseZ <= 26000) {                  // Projects exit / Connect entry
           bgZ = 14000 + (baseZ - 21000);             // 14000 → 19000
        } else if (baseZ <= 28000) {                  // Connect dwell
           bgZ = 19000;
        } else if (baseZ <= 34000) {                  // Connect exit (28k-31k) & Message entry (31k-34k)
           bgZ = 19000 + (baseZ - 28000);             // 19000 → 25000
        } else {                                      // Message dwell
           bgZ = 25000;
        }

        tZ = HOME_Z - bgZ;
        // ALMOST NO FLOAT when resting on the landing page, perfectly stable.
        // Float scales up slightly only when actually scrolling deep into space.
        const floatScale = 15 + sp * 150; 
        tX = Math.sin(elapsed * 0.22) * floatScale;
        tY = Math.cos(elapsed * 0.17) * (floatScale * 0.6);
      }

      // ─── SPRING PHYSICS ────────────────────────────────
      const szPz = springStep(cam.pz.pos, cam.pz.vel, tZ, 20,   0.75, dt);
      const szPx = springStep(cam.px.pos, cam.px.vel, tX, 3.5, 0.65, dt);
      const szPy = springStep(cam.py.pos, cam.py.vel, tY, 3.5, 0.65, dt);
      cam.pz = szPz; cam.px = szPx; cam.py = szPy;

      camera.position.set(szPx.pos, szPy.pos, szPz.pos);
      if (closeParticlesMaterial) {
        closeParticlesMaterial.uniforms.cameraZ.value = szPz.pos;
      }

      // ─── LOOK-AT (GIMBAL) ────────────────────────────────
      let lkX, lkY, lkZ;
      if (inIntro) {
        lkZ = tZ - 3000;
        lkX = szPx.pos * 0.1;
        lkY = szPy.pos * 0.1;
      } else {
        lkZ = szPz.pos - 4000;
        lkX = szPx.pos * 0.15 + Math.sin(elapsed * 0.05) * 50;
        lkY = szPy.pos * 0.15 + Math.cos(elapsed * 0.06) * 35;
      }

      const slkX = springStep(cam.lx.pos, cam.lx.vel, lkX, 4, 0.78, dt);
      const slkY = springStep(cam.ly.pos, cam.ly.vel, lkY, 4, 0.78, dt);
      cam.lx = slkX; cam.ly = slkY;

      camera.lookAt(slkX.pos, slkY.pos, lkZ);

      // ─── ROLL ────────────────────────────────────────────
      const lateralAccel = szPx.vel;
      const rollTarget   = -lateralAccel * 0.0012 +
        (inIntro
          ? Math.sin(elapsed * 2.5)  * 0.025 * Math.sin(introT * Math.PI)
          : Math.sin(elapsed * 0.18) * 0.010);
      const sRoll = springStep(cam.roll.pos, cam.roll.vel, rollTarget, 5, 0.72, dt);
      cam.roll = sRoll;
      camera.rotateZ(sRoll.pos);

      // ─── BLOOM ────────────────────────────────────────────
      // Static bloom to prevent the scene from washing out with light.
      // Keeps space feeling vast and genuinely dark.
      bloomPass.strength = 1.4;

      composer.render();
    };

    animate();

    // ── RESIZE ────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      if (containerRef.current?.contains(renderer.domElement))
        containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ position:'absolute', inset:0, zIndex:1 }} />;
}
