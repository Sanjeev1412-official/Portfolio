import React, { useEffect, useRef } from 'react';
import { PhysicsStore } from '../hooks/ScrollContext';

export default function Message() {
  const sectionRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const camZ = PhysicsStore.camZ;

      // Message section sits at Z=34000
      // Enter: 31000 to 34000 (dist 3000 to 0)
      // Dwell: 34000 onwards (dist <= 0)
      const SECTION_Z = 39000;
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
      } else {
        opacity = 1;
        scale = 1;
        pointerEvents = 'auto';
      }

      opacity = Math.max(0, Math.min(1, opacity));

      if (sectionRef.current) {
        sectionRef.current.style.opacity = opacity.toFixed(4);
        sectionRef.current.style.pointerEvents = pointerEvents;
        sectionRef.current.style.willChange = 'opacity';
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `scale(${scale || 0})`;
        innerRef.current.style.willChange = 'transform';
      }
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section id="message" className="panel panel-message" ref={sectionRef}>
      <div className="msg-inner" ref={innerRef}>
        
        {/* SVG Refraction Filter for Form Card */}
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
          <defs>
            <filter id="liquid-glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.007 0.007" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="45" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        {/* Section Header */}
        <div className="msg-header">
          <span className="msg-label">CHAPTER VI</span>
          <h2 className="msg-heading">
            <span className="msg-hollow">SEND ME</span>{' '}
            <span>A MESSAGE.</span>
          </h2>
          <p className="msg-sub">Drop a line, ask a question, or let's start a project together.</p>
          <div className="msg-header-rule" />
        </div>

        {/* Message Form */}
        <div className="msg-form-wrapper">
          {/* Corner accents */}
          <div className="msg-corner msg-corner--tl" />
          <div className="msg-corner msg-corner--tr" />
          <div className="msg-corner msg-corner--bl" />
          <div className="msg-corner msg-corner--br" />

          <form className="msg-form" onSubmit={(e) => e.preventDefault()}>
            <div className="msg-form-row">
              <div className="msg-input-group">
                <label htmlFor="name">NAME</label>
                <input type="text" id="name" placeholder="John Doe" />
              </div>
              <div className="msg-input-group">
                <label htmlFor="email">EMAIL</label>
                <input type="email" id="email" placeholder="john@example.com" />
              </div>
            </div>
            
            <div className="msg-input-group">
              <label htmlFor="subject">SUBJECT</label>
              <input type="text" id="subject" placeholder="Project Inquiry" />
            </div>

            <div className="msg-input-group">
              <label htmlFor="message">MESSAGE</label>
              <textarea id="message" rows="4" placeholder="Hello, I'd like to discuss..."></textarea>
            </div>

            <button type="submit" className="msg-submit-btn">
              <span className="msg-btn-text">SEND MESSAGE</span>
   
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
