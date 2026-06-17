import React, { useEffect, useState, useRef } from 'react';
import { useScrollProgress } from '../hooks/ScrollContext';

// Spring damper math to exactly match ThreeHero camera Z-axis physics
function springStep(curr, vel, target, k, d, dt) {
  const f   = (target - curr) * k;
  const newV = (vel + f * dt) * Math.pow(d, dt * 60);
  return { pos: curr + newV * dt, vel: newV };
}

import { PhysicsStore } from '../hooks/ScrollContext';

export default function Hero() {
  const { progress } = useScrollProgress();
  const [cinemaActive, setCinemaActive] = useState(false);
  const [showW1, setShowW1] = useState(false);
  const [showW2, setShowW2] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [burnWords, setBurnWords] = useState([]);
  const [shiftLeft, setShiftLeft] = useState(false);
  const [flashSpeedlines, setFlashSpeedlines] = useState(false);
  const [chromaBurst, setChromaBurst] = useState(false);
  
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const chromaRef = useRef(null);
  const gateRef = useRef(null);

  const [isVisible, setIsVisible] = useState(true);
  const introPlayed = useRef(false);

  // Trigger visibility based on scroll
  useEffect(() => {
    setIsVisible(progress < 0.1);
  }, [progress]);

  // ─── 60FPS PERFECT SYNC ANIMATION LOOP ───
  // We bypass React state for scroll updates to eliminate jank.
  // We also replicate the exact physics spring of the 3D drone.
  const progressRef = useRef(progress);
  const smoothP = useRef(0);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Read physics globally to guarantee perfect sync with other components
      const camZ = PhysicsStore.camZ;

      // Calculate a "simulated progress" based on the actual physical camera position
      const simulatedSp = camZ.pos / 12000;

      const clampedSp = Math.min(simulatedSp, 0.25);
      const heroScale = 1 + Math.pow(clampedSp * 5, 3) * 10 + clampedSp * 10;
      const textOpacity = Math.max(0, 1 - simulatedSp * 5); // Fully fades out at sp = 0.2 (camZ = 2400)
      const pointerEvents = simulatedSp > 0.05 ? 'none' : 'auto';

      if (heroRef.current) {
        heroRef.current.style.opacity = textOpacity;
        heroRef.current.style.pointerEvents = pointerEvents;
        heroRef.current.style.visibility = textOpacity <= 0 ? 'hidden' : 'visible';
        heroRef.current.style.willChange = 'opacity, visibility';
      }
      if (chromaRef.current) chromaRef.current.style.opacity = textOpacity;
      if (gateRef.current) gateRef.current.style.opacity = textOpacity;
      if (stageRef.current) {
        stageRef.current.style.transform = `scale(${heroScale})`;
        stageRef.current.style.willChange = 'transform';
      }
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  // ─── TEXT INTRO ANIMATION SEQUENCE ───
  useEffect(() => {
    const timers = [];
    const intervals = [];

    if (isVisible) {
      const delay = introPlayed.current ? 0 : 4500;
      introPlayed.current = true;

      setFlashSpeedlines(false);
      setCinemaActive(false);
      setShowW1(false);
      setShowW2(false);
      setGlitch(false);
      setBurnWords([]);
      setShiftLeft(false);
      setChromaBurst(false);

      timers.push(setTimeout(() => setFlashSpeedlines(true), delay > 0 ? 0 : 100));
      timers.push(setTimeout(() => setFlashSpeedlines(false), delay > 0 ? 500 : 600));
      timers.push(setTimeout(() => setCinemaActive(true), delay > 0 ? 500 : 200));

      timers.push(setTimeout(() => setShowW1(true), delay + 50));
      timers.push(setTimeout(() => {
        setShowW2(true);
        timers.push(setTimeout(() => {
          setGlitch(true); setChromaBurst(true);
          timers.push(setTimeout(() => { setGlitch(false); setChromaBurst(false); }, 350));
        }, 80));
      }, delay + 300));

      [0, 1, 2, 3, 4].forEach((i) => {
        timers.push(setTimeout(() => setBurnWords(prev => [...prev, i]), delay + 1800 + i * 160));
      });

      timers.push(setTimeout(() => setShiftLeft(true), delay + 3100));

      timers.push(setTimeout(() => {
        const interval = setInterval(() => {
          setGlitch(true); setChromaBurst(true);
          timers.push(setTimeout(() => { setGlitch(false); setChromaBurst(false); }, 350));
        }, 7000);
        intervals.push(interval);
      }, delay + 4100));

    } else {
      // If we scroll past the intro threshold, force the intro to its finished state
      // so the text doesn't snap back to the center and disappear.
      setFlashSpeedlines(false);
      setCinemaActive(true);
      setShowW1(true);
      setShowW2(true);
      setGlitch(false);
      setBurnWords([0, 1, 2, 3, 4]);
      setShiftLeft(true);
      setChromaBurst(false);
    }

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [isVisible]);

  return (
    <section id="hero" ref={heroRef} className={`panel ${cinemaActive ? 'cinema-active' : ''}`}>
      <div className="cinema-bar cinema-bar-top"></div>
      <div className="cinema-bar cinema-bar-bottom"></div>
      <div className="hero-vignette"></div>
      
      <div className={`speedlines ${flashSpeedlines ? 'flash' : ''}`}>
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
      </div>
      
      <div className={`chroma-layer ${chromaBurst ? 'burst' : ''}`} ref={chromaRef}></div>
      
      {/* MASSIVE ZOOM EFFECT TIED DIRECTLY TO EXACT PHYSICS CAMERA SCROLL */}
      <div className="cinema-stage" ref={stageRef}>
        
        <div className={`cinema-title-block ${shiftLeft ? 'shift-left' : ''}`}>
          <div className="cinema-pretitle">
            <span className="pretitle-line"></span>
            <span className="pretitle-text">PRESENTS</span>
            <span className="pretitle-line"></span>
          </div>
          <div className={`cinema-name-wrap ${glitch ? 'glitch' : ''}`}>
            <h1 className="cinema-name" style={{ whiteSpace: 'nowrap' }}>
              <span style={{ display: 'block' }} className={`cn-word ${showW1 ? 'in' : ''}`}>Hello, I'm_</span>
              <span style={{ display: 'block' }} className={`cn-word ${showW2 ? 'in' : ''}`}>Sanjeev S Nair</span>
            </h1>
            <div className="cinema-name-echo echo-r" aria-hidden="true" style={{ whiteSpace: 'nowrap' }}>
              <span style={{ display: 'block' }}>Hello, I'm_</span>
              <span style={{ display: 'block' }}>Sanjeev S Nair</span>
            </div>
            <div className="cinema-name-echo echo-b" aria-hidden="true" style={{ whiteSpace: 'nowrap' }}>
              <span style={{ display: 'block' }}>Hello, I'm_</span>
              <span style={{ display: 'block' }}>Sanjeev S Nair</span>
            </div>
          </div>
          <div className="cinema-subtitle">
            <div className="subtitle-rule"></div>
            <span className="subtitle-text">FULL&nbsp;&nbsp;STACK&nbsp;&nbsp;ENGINEER</span>
            <div className="subtitle-rule"></div>
          </div>
          <div className="cinema-tagline">
            <span className={burnWords.includes(0) ? 'burn' : ''}>
              Computer Science Engineering student and developer passionate about building intelligent, user-focused digital solutions for real-world problems.
            </span>
            <span className={burnWords.includes(1) ? 'burn' : ''}>
              I enjoy turning ideas into meaningful products through code, creativity, and innovation, with interests in AI, web development, and modern user experiences.
            </span>
          </div>
        </div>

        <div className={`cinema-poster ${shiftLeft ? 'fly-in' : ''}`}>
          <img src="/wanted_poster.png" alt="Wanted" className="poster-img" />
        </div>
      </div>
      
      <div className="cinema-gate" ref={gateRef}>
        <button className="gate-btn" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} aria-label="Enter portfolio">
          <span className="gate-pulse"></span>
          <span className="gate-label">ENTER</span>
          <span className="gate-sub">scroll to explore</span>
        </button>
      </div>
    </section>
  );
}
