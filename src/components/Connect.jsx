import React, { useEffect, useRef } from 'react';
import { PhysicsStore } from '../hooks/ScrollContext';

const CONNECT_PLATFORMS = [
  {
    id: 'C01',
    name: 'LinkedIn',
    label: 'PROFESSIONAL NETWORKING',
    value: 'Sanjeev S Nair',
    link: 'https://linkedin.com/in/sanjeev-s-nair',
    btnText: 'VIEW PROFILE',
    status: 'ACTIVE',
    color: '#0077B5'
  },
  {
    id: 'C02',
    name: 'GitHub',
    label: 'SOURCE CODE & PROJECTS',
    value: 'sanjeev-s-nair',
    link: 'https://github.com/sanjeev-s-nair',
    btnText: 'BROWSE CODE',
    status: 'UPDATED',
    color: '#F0F6FC'
  },
  {
    id: 'C03',
    name: 'WhatsApp',
    label: 'INSTANT MESSAGE',
    value: '+91 99999 99999',
    link: 'https://wa.me/919999999999',
    btnText: 'START CHAT',
    status: 'ONLINE',
    color: '#25D366'
  },
  {
    id: 'C04',
    name: 'Email',
    label: 'OFFICIAL INQUIRIES',
    value: 'sanjeevsnair.dev@gmail.com',
    link: 'mailto:sanjeevsnair.dev@gmail.com',
    btnText: 'SEND EMAIL',
    status: 'FAST RESPOND',
    color: '#FFB000'
  },
  {
    id: 'C05',
    name: 'Instagram',
    label: 'CREATIVE & SOCIAL',
    value: '@sanjeev_s_nair',
    link: 'https://instagram.com/sanjeev_s_nair',
    btnText: 'FOLLOW ME',
    status: 'ONLINE',
    color: '#E1306C'
  },
  {
    id: 'C06',
    name: 'Call',
    label: 'DIRECT VOICEMAIL',
    value: '+91 99999 99999',
    link: 'tel:+919999999999',
    btnText: 'CALL DIRECT',
    status: 'AVAILABLE',
    color: '#00F5FF'
  }
];

function getPlatformIcon(name) {
  switch (name) {
    case 'LinkedIn':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      );
    case 'GitHub':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
      );
    case 'WhatsApp':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      );
    case 'Email':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      );
    case 'Instagram':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      );
    case 'Call':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      );
    default:
      return null;
  }
}

function ConnectionCard({ platform, index }) {
  const customStyle = {
    '--card-accent': platform.color,
    '--card-accent-g': `${platform.color}22`,
    animationDelay: `${index * 0.08}s`
  };

  return (
    <div className="conn-card" style={customStyle}>
      {/* Corner accents */}
      <div className="conn-corner conn-corner--tl" />
      <div className="conn-corner conn-corner--tr" />
      <div className="conn-corner conn-corner--bl" />
      <div className="conn-corner conn-corner--br" />

      {/* Top row */}
      <div className="conn-card-top">
        <div className="conn-icon-wrapper">
          {getPlatformIcon(platform.name)}
        </div>
        <span className="conn-status-badge">
          <span className="conn-status-dot" />
          {platform.status}
        </span>
      </div>

      {/* Main content */}
      <div className="conn-card-body">
        <span className="conn-card-label">{platform.label}</span>
        <h3 className="conn-card-platform">{platform.name}</h3>
        <p className="conn-card-value">{platform.value}</p>
      </div>

      {/* Action footer */}
      <div className="conn-card-footer">
        <a 
          href={platform.link} 
          className="conn-card-link" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <span>{platform.btnText}</span>
          <span className="conn-card-arrow">↗</span>
        </a>
      </div>
    </div>
  );
}

export default function Connect() {
  const sectionRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const camZ = PhysicsStore.camZ;

      // Connect section sits at Z=26000
      // Enter: 23000 to 26000 (dist 3000 to 0)
      // Dwell: 26000 onwards (dist <= 0)
      const SECTION_Z = 26000;
      const dist = SECTION_Z - camZ.pos;

      let opacity = 0;
      let scale = 1;
      let pointerEvents = 'none';

      if (dist > 3000) {
        opacity = 0;
        scale = 0.05;
      } else if (dist > 0) {
        const u = dist / 3000; // 1 -> 0
        scale = 1 - Math.pow(u, 1.5) * 0.95;
        opacity = Math.pow(1 - u, 2);
        pointerEvents = dist < 800 ? 'auto' : 'none';
      } else if (dist > -2000) {
        // Dwell
        opacity = 1;
        scale = 1;
        pointerEvents = 'auto';
      } else if (dist > -5000) {
        // Exit
        const u = (-2000 - dist) / 3000; // 0 -> 1
        scale = 1 + Math.pow(u, 1.5) * 1.5;
        opacity = Math.pow(1 - u, 2);
        pointerEvents = 'none';
      } else {
        opacity = 0;
        scale = 2.5;
        pointerEvents = 'none';
      }

      opacity = Math.max(0, Math.min(1, opacity));

      if (sectionRef.current) {
        sectionRef.current.style.opacity = opacity.toFixed(4);
        sectionRef.current.style.pointerEvents = pointerEvents;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `scale(${scale || 0})`;
      }
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section id="connect" className="panel panel-connect" ref={sectionRef}>
      <div className="conn-inner" ref={innerRef}>
        
        {/* SVG Refraction Filter */}
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
          <defs>
            <filter id="liquid-glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.007 0.007" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="45" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        {/* ── Background Bloom ── */}
        <div className="conn-bg-bloom" />

        <div className="conn-header">
          <span className="conn-label">CHAPTER V</span>
          <h2 className="conn-heading">
            <span className="con-hollow">LET'S</span>{' '}
            <span>CONNECT</span>
          </h2>
          <p className="conn-sub">Get in touch via my official networking channels and platforms.</p>
          <div className="conn-header-rule" />
        </div>

        {/* Bento Grid */}
        <div className="conn-grid">
          {CONNECT_PLATFORMS.map((platform, i) => (
            <ConnectionCard key={platform.id} platform={platform} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
