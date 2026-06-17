import React, { useEffect } from 'react';

export default function NoiseOverlay() {
  useEffect(() => {
    // Inject keyframes
    const styleId = 'noise-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
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
    }
  }, []);

  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="grain-filter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="linearRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
            <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended"/>
            <feComposite in="blended" in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
      </svg>
      <div 
        id="grain-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9990,
          opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          animation: 'grain-shift 0.12s steps(1) infinite'
        }}
      />
    </>
  );
}
