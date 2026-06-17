import React, { createContext, useContext, useEffect, useState } from 'react';

const ScrollContext = createContext({ progress: 0 });

export const PhysicsStore = {
  progress: 0,
  sp: 0,
  camZ: { pos: 0, vel: 0 }
};

// Global physics loop to ensure all components see the EXACT same math
let lastNow = performance.now();

function springStep(curr, vel, target, k, d, dt) {
  const f = (target - curr) * k;
  const newV = (vel + f * dt) * Math.pow(d, dt * 60);
  return { pos: curr + newV * dt, vel: newV };
}

function physicsLoop() {
  requestAnimationFrame(physicsLoop);
  const now = performance.now();
  const dt = Math.min((now - lastNow) * 0.001, 0.033);
  lastNow = now;

  // Frame-independent smoothing (approx matches old 0.15 multiplier at 60fps)
  PhysicsStore.sp += (PhysicsStore.progress - PhysicsStore.sp) * 10 * dt;
  
  const tZ = PhysicsStore.sp * 45000;
  PhysicsStore.camZ = springStep(PhysicsStore.camZ.pos, PhysicsStore.camZ.vel, tZ, 20, 0.75, dt);
}
requestAnimationFrame(physicsLoop);

// Force manual scroll restoration globally as early as possible
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export function ScrollProvider({ children }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset our physics store variables on fresh mount/refresh
    PhysicsStore.progress = 0;
    PhysicsStore.sp = 0;
    PhysicsStore.camZ = { pos: 0, vel: 0 };

    const handleScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const currentScroll = window.scrollY;
      const p = Math.min(Math.max(currentScroll / maxScroll, 0), 1);
      setProgress(p);
      PhysicsStore.progress = p; // Update global store instantly
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Force scroll to top on mount
    window.scrollTo(0, 0);
    handleScroll();

    // Backup scroll reset on the next tick to ensure layout has computed
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
      handleScroll();
    }, 0);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ScrollContext.Provider value={{ progress }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollProgress() {
  return useContext(ScrollContext);
}

// Helpers for animating sections
export function getSectionOpacity(progress, startIn, endIn, startOut, endOut) {
  if (progress <= startIn || progress >= endOut) return 0;
  if (progress >= endIn && progress <= startOut) return 1;
  if (progress > startIn && progress < endIn) {
    return (progress - startIn) / (endIn - startIn);
  }
  if (progress > startOut && progress < endOut) {
    return 1 - (progress - startOut) / (endOut - startOut);
  }
  return 0;
}

export function getSectionScale(progress, start, end, minScale = 0.9, maxScale = 1.1) {
  if (progress <= start) return minScale;
  if (progress >= end) return maxScale;
  return minScale + (maxScale - minScale) * ((progress - start) / (end - start));
}
