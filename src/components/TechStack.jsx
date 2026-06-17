import React, { useEffect, useRef } from 'react';
import { PhysicsStore } from '../hooks/ScrollContext';

const TECH_DATA = {
  frontend: {
    label: 'FRONTEND',
    icon: '◈',
    desc: 'Building responsive and interactive user experiences with modern web technologies.',
    items: [
      { name: 'React.js',     icon: '⚛'  },
      { name: 'JavaScript',   icon: '⚡'  },
      { name: 'TypeScript',   icon: '⑆'  },
      { name: 'HTML',         icon: '❮❯' },
      { name: 'CSS',          icon: '⛶'  },
      { name: 'Tailwind CSS', icon: '〰'  },
      { name: 'Vite',         icon: '◬'  },
    ],
  },
  backend: {
    label: 'BACKEND',
    icon: '◉',
    desc: 'Developing scalable backend systems and APIs for modern applications.',
    items: [
      { name: 'Node.js',    icon: '⬢' },
      { name: 'Express.js', icon: '⌯' },
      { name: 'Java',       icon: '☕' },
      { name: 'Python',     icon: '⟠' },
      { name: 'C',          icon: '⚙' },
      { name: 'Firebase',   icon: '◮' },
      { name: 'MySQL',      icon: '⛁' },
    ],
  },
  tools: {
    label: 'TOOLS / PLATFORMS',
    icon: '◎',
    desc: 'Tools and platforms I use to streamline development and productivity.',
    items: [
      { name: 'VS Code',      icon: '◧' },
      { name: 'Git',          icon: '⎇' },
      { name: 'GitHub',       icon: '⌗' },
      { name: 'Antigravity',  icon: '⏏' },
    ],
  },
};

export default function TechStack() {
  const sectionRef = useRef(null);
  const innerRef   = useRef(null);

  useEffect(() => {
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const camZ = PhysicsStore.camZ;

      // TechStack sits at Z=10000 in the virtual camera timeline.
      // Journey exits at around camZ≈9000.
      // We want TechStack to appear after Journey's zoom-in phase.
      const SECTION_Z = 10000;
      const dist = SECTION_Z - camZ.pos; // positive => not reached yet

      let opacity = 0;
      let scale   = 1;
      let pointerEvents = 'none';

      if (dist > 1000) {
        // Section not yet reached — hidden (only starts appearing after Journey is gone at Z=9000)
        opacity = 0;
        scale   = 0.05;
      } else if (dist > 0) {
        // Approaching — zoom in (same mathematical style as Projects and Connect)
        const u = dist / 1000;          // 1→0
        scale   = 1 - Math.pow(u, 1.5) * 0.95; 
        opacity = Math.pow(1 - u, 2);
        pointerEvents = dist < 300 ? 'auto' : 'none';
      } else if (dist > -2000) {
        // Dwelling — fully visible
        opacity = 1;
        scale   = 1;
        pointerEvents = 'auto';
      } else if (dist > -5000) {
        // Exiting — zoom past camera
        const u = Math.abs(dist + 2000) / 3000; // 0→1
        scale   = 1 + Math.pow(u, 2) * 12;
        opacity = Math.max(0, 1 - Math.pow(u, 1.2));
      } else {
        opacity = 0;
      }

      opacity = Math.max(0, Math.min(1, opacity));

      if (sectionRef.current) {
        sectionRef.current.style.opacity       = opacity.toFixed(4);
        sectionRef.current.style.pointerEvents = pointerEvents;
        sectionRef.current.style.willChange    = 'opacity';
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
    <section id="tech-stack" className="panel panel-techstack" ref={sectionRef}>
      <div className="ts-inner" ref={innerRef}>

        {/* ── Section Header ─────────────────────────────── */}
        <div className="ts-header">
          <span className="ts-label">CHAPTER III</span>
          <h2 className="ts-heading">
            <span className="tsh-hollow">TECH</span>{' '}
            <span>STACK</span>
          </h2>
          <p className="ts-sub">Tools and technologies I use to bring ideas to life.</p>
          <div className="ts-header-rule" />
        </div>

        {/* ── Background Bloom ───────────────────────────── */}
        <div className="ts-bg-bloom" />

        {/* ── Three-column grid ──────────────────────────── */}
        <div className="ts-grid">
          {Object.values(TECH_DATA).map((cat, ci) => (
            <div className="ts-col" key={ci}>
              {/* Column header */}
              <div className="ts-col-header">
                <span className="tsch-icon">{cat.icon}</span>
                <span className="tsch-title">{cat.label}</span>
                <div className="tsch-rule" />
              </div>
              <p className="ts-col-desc">{cat.desc}</p>

              {/* Tech pills */}
              <div className="ts-pills">
                {cat.items.map((tech, ti) => (
                  <div
                    className="ts-pill"
                    key={ti}
                    style={{ animationDelay: `${(ci * 7 + ti) * 0.06}s` }}
                  >
                    <span className="ts-pill-icon">{tech.icon}</span>
                    <span className="ts-pill-name">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        

      </div>
    </section>
  );
}
