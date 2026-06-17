import React, { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero', label: 'HOME', scrollTarget: 0 },
  { id: 'journey', label: 'JOURNEY', scrollTarget: 0.125 }, // 5000 / 40000
  { id: 'tech', label: 'TECH STACK', scrollTarget: 0.25 }, // 10000 / 40000
  { id: 'projects', label: 'PROJECTS', scrollTarget: 0.45 }, // 18000 / 40000
  { id: 'connect', label: 'CONNECT', scrollTarget: 0.65 } // 26000 / 40000
];

export default function HudNav() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      
      const progress = y / maxScroll;
      
      // Determine which section is currently active based on proximity
      let closest = 0;
      let minDiff = Infinity;
      
      SECTIONS.forEach((sec, i) => {
        const diff = Math.abs(progress - sec.scrollTarget);
        if (diff < minDiff) {
          minDiff = diff;
          closest = i;
        }
      });
      
      setActiveIndex(closest);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, targetSp) => {
    e.preventDefault();
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    window.scrollTo({
      top: targetSp * maxScroll,
      behavior: 'smooth'
    });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* Subtle watermark logo in top left */}
      <div className="hud-watermark-logo" onClick={scrollToTop}>
        YN
      </div>

      {/* Vertical HUD Navigation on the right */}
      <nav className="hud-nav">
        <div className="hud-axis"></div>
        <div className="hud-nodes">
          {SECTIONS.map((sec, i) => {
            const isActive = i === activeIndex;
            return (
              <div 
                key={sec.id} 
                className={`hud-node-wrapper ${isActive ? 'active' : ''}`}
                onClick={(e) => scrollToSection(e, sec.scrollTarget)}
              >
                <div className="hud-node">
                  <div className="hud-node-inner"></div>
                </div>
                <div className="hud-label">{sec.label}</div>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
