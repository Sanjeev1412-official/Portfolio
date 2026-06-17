import React, { useEffect, useRef, useState } from 'react';
import { PhysicsStore } from '../hooks/ScrollContext';
import projectThumb from '../assets/project_thumb.png';

// ─── DEMO PROJECT DATA ────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 'P01',
    num: '001',
    name: 'NexaUI Dashboard',
    tagline: 'Real-time analytics reimagined.',
    desc: 'A high-performance analytics dashboard with live data streams, customisable widget grids, dark-mode-first design and role-based access control.',
    stack: ['React.js', 'TypeScript', 'Node.js', 'Socket.io', 'Tailwind CSS', 'MySQL'],
    year: '2024',
    type: 'WEB APP',
    liveUrl: '#',
    sourceUrl: '#',
    thumb: projectThumb,
  },
  {
    id: 'P02',
    num: '002',
    name: 'Orbital CMS',
    tagline: 'Content management at escape velocity.',
    desc: 'A headless CMS built for developers. Schema-driven, API-first, with a cinematic markdown editor, media pipeline and granular permission system.',
    stack: ['Next.js', 'TypeScript', 'Express.js', 'Firebase', 'CSS'],
    year: '2024',
    type: 'FULL-STACK',
    liveUrl: '#',
    sourceUrl: '#',
    thumb: projectThumb,
  },
  {
    id: 'P03',
    num: '003',
    name: 'Spectra AI',
    tagline: 'Your intelligent coding co-pilot.',
    desc: 'An AI-powered code review and suggestion tool that integrates directly into VS Code. Analyses patterns, catches bugs and proposes optimisations in real-time.',
    stack: ['Python', 'FastAPI', 'React.js', 'JavaScript', 'Firebase'],
    year: '2025',
    type: 'AI / ML',
    liveUrl: '#',
    sourceUrl: '#',
    thumb: projectThumb,
  },
  {
    id: 'P04',
    num: '004',
    name: 'Vault Finance',
    tagline: 'Personal finance with terminal aesthetics.',
    desc: 'A minimalist personal finance tracker with budgeting rules, spending velocity graphs and exportable reports — all in a sleek, keyboard-first interface.',
    stack: ['React.js', 'Vite', 'Node.js', 'MySQL', 'CSS'],
    year: '2025',
    type: 'WEB APP',
    liveUrl: '#',
    sourceUrl: '#',
    thumb: projectThumb,
  },
  {
    id: 'P05',
    num: '005',
    name: 'Phantom Store',
    tagline: 'E-commerce without compromise.',
    desc: 'A full-featured e-commerce platform with real-time inventory, Stripe integration, order tracking and a drag-and-drop storefront builder for merchants.',
    stack: ['React.js', 'Express.js', 'Node.js', 'MySQL', 'Tailwind CSS', 'Java'],
    year: '2025',
    type: 'E-COMMERCE',
    liveUrl: '#',
    sourceUrl: '#',
    thumb: projectThumb,
  },
];

// ─── SINGLE PROJECT CARD ──────────────────────────────────────────────────────
function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const isEven = index % 2 === 0;

  return (
    <article
      className={`prj-card ${isEven ? 'prj-card--even' : 'prj-card--odd'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="prj-card-content">
        {/* ── Number badge ── */}
        <div className="prj-num">{project.num}</div>

        {/* ── Top: thumbnail ── */}
        <div className={`prj-thumb-wrap ${hovered ? 'prj-thumb-wrap--hovered' : ''}`}>
          <div className="prj-thumb-frame">
            <img src={project.thumb} alt={project.name} className="prj-thumb-img" />
            <div className="prj-thumb-overlay">
              <span className="prj-thumb-label">{project.id}</span>
            </div>
            {/* Scanlines */}
            <div className="prj-scanlines" />
          </div>
          {/* Corner accents */}
          <div className="prj-corner prj-corner--tl" />
          <div className="prj-corner prj-corner--tr" />
          <div className="prj-corner prj-corner--bl" />
          <div className="prj-corner prj-corner--br" />
        </div>

        {/* ── Bottom: info ── */}
        <div className="prj-info">
          <div className="prj-meta-row">
            <span className="prj-type">{project.type}</span>
            <span className="prj-year">{project.year}</span>
          </div>

          <h3 className="prj-name">{project.name}</h3>
          <p className="prj-tagline">{project.tagline}</p>

          <div className="prj-rule" />

          <p className="prj-desc">{project.desc}</p>

          {/* Tech stack pills */}
          <div className="prj-stack">
            {project.stack.map((tech, i) => (
              <span className="prj-tag" key={i}>{tech}</span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="prj-actions">
            <a
              href={project.liveUrl}
              className="prj-btn prj-btn--primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="prj-btn-icon">▶</span>
              <span>Live Demo</span>
              <span className="prj-btn-arrow">↗</span>
            </a>
            <a
              href={project.sourceUrl}
              className="prj-btn prj-btn--secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="prj-btn-icon">⌗</span>
              <span>Source Code</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Projects() {
  const sectionRef = useRef(null);
  const innerRef   = useRef(null);
  const listRef    = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    let animId;
    let cachedCards = null;

    const getCards = () => {
      if (!cachedCards && listRef.current) {
        cachedCards = Array.from(listRef.current.children);
      }
      return cachedCards || [];
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const camZ = PhysicsStore.camZ;

      // Projects sit at Z=18000. 
      // Enter: 15000-18000 (dist 3000 to 0)
      // Dwell: 18000-21000 (dist 0 to -3000)
      // Exit:  21000-24000 (dist -3000 to -6000)
      const SECTION_Z = 18000;
      const dist = SECTION_Z - camZ.pos;

      let opacity = 0;
      let scale   = 1;
      let pointerEvents = 'none';
      let listX = 0;
      let clipAmt = 5; // Initial barrier of 5vw on left and right

      if (dist > 3000) {
        opacity = 0;
        scale   = 0.05;
      } else if (dist > 0) {
        const u = dist / 3000; // 1 (far) down to 0 (arrived)
        // Perspective-based zoom in: starts tiny (0.05) and accelerates toward camera (1.0)
        scale   = 1 - Math.pow(u, 1.5) * 0.95; 
        // Smooth fade-in: stays transparent longer as it starts flying in
        opacity = Math.pow(1 - u, 2);
        pointerEvents = dist < 800 ? 'auto' : 'none';
      } else if (dist > -3000) {
        // Dwell — Scroll horizontally
        opacity = 1;
        scale   = 1;
        pointerEvents = 'auto';
        
        const scrollU = dist / -3000; // 0 to 1
        // Rapidly remove the 5vw barrier in the first 5% of horizontal scroll
        clipAmt = Math.max(0, 5 - (scrollU * 100));

        if (listRef.current) {
          const isMobile = window.innerWidth <= 900;
          if (!isMobile) {
            // padding is 5vw on left/right, so visible container width is innerWidth * 0.9
            const containerWidth = window.innerWidth * 0.9;
            const maxScroll = Math.max(0, listRef.current.scrollWidth - containerWidth);
            listX = scrollU * maxScroll;
            listRef.current.style.transform = `translateX(-${listX}px)`;
            
            // Clear inline styles in case we resized from mobile
            getCards().forEach(card => {
              card.style.transform = '';
              card.style.opacity = '';
              card.style.zIndex = '';
              card.style.backgroundColor = '';
              const contentEl = card.querySelector('.prj-card-content');
              if (contentEl) contentEl.style.opacity = '';
            });
          } else {
            // Mobile Stacked Fly-Out Animation
            listRef.current.style.transform = `translateX(0)`;
            const cards = getCards();
            const numCards = cards.length;
            
            cards.forEach((card, i) => {
              const flightProgress = scrollU * numCards; 
              const stackPos = i - flightProgress;
              
              let cardTransform = '';
              let cardOpacity = 1;
              let zIndex = numCards - i;
              let contentOpacity = 1;
              let cardBgOpacity = 0;
              
              if (stackPos < 0) {
                // Flying out
                const flyOutU = Math.min(1, -stackPos);
                const flyX = flyOutU * -120; // fly left 120vw
                const flyRot = flyOutU * -15; // rotate slightly left
                cardTransform = `translate(calc(-50% + ${flyX}vw), -50%) scale(${1 + flyOutU * 0.1}) rotateZ(${flyRot}deg)`;
                cardOpacity = 1 - flyOutU;
              } else {
                // In stack
                const scaleVal = Math.max(0.8, 1 - stackPos * 0.05);
                const yOffset = stackPos * 30; // 30px down per card
                cardTransform = `translate(-50%, calc(-50% + ${yOffset}px)) scale(${scaleVal})`;
                cardOpacity = Math.max(0, 1 - stackPos * 0.3);
                contentOpacity = Math.max(0, 1 - stackPos * 2);
                cardBgOpacity = Math.min(0.95, stackPos);
              }
              
              card.style.transform = cardTransform;
              card.style.opacity = cardOpacity.toFixed(4);
              card.style.zIndex = zIndex;
              card.style.backgroundColor = `rgba(0, 0, 0, ${cardBgOpacity.toFixed(4)})`;
              const contentEl = card.querySelector('.prj-card-content');
              if (contentEl) {
                contentEl.style.opacity = contentOpacity.toFixed(4);
              }
            });
          }
        }
      } else if (dist > -6000) {
        const u = Math.abs(dist + 3000) / 3000;
        scale   = 1 + Math.pow(u, 2) * 12;
        opacity = Math.max(0, 1 - Math.pow(u, 1.2));
        clipAmt = 0;
        
        if (listRef.current) {
          const isMobile = window.innerWidth <= 900;
          if (!isMobile) {
            const containerWidth = window.innerWidth * 0.9;
            const maxScroll = Math.max(0, listRef.current.scrollWidth - containerWidth);
            listX = maxScroll;
          }
        }
      } else {
        opacity = 0;
        clipAmt = 0;
      }

      opacity = Math.max(0, Math.min(1, opacity));

      // Global Mobile Stack Application
      if (listRef.current) {
        const isMobile = window.innerWidth <= 900;
        if (isMobile) {
          // Clamp scrollU between 0 and 1 for the dwell phase
          const clampedScrollU = Math.max(0, Math.min(1, dist / -3000));
          const cards = getCards();
          const numCards = cards.length;
          
          cards.forEach((card, i) => {
            const flightProgress = clampedScrollU * numCards; 
            const stackPos = i - flightProgress;
            
            let cardTransform = '';
            let cardOpacity = 1;
            let zIndex = numCards - i;
            let contentOpacity = 1;
            let cardBgOpacity = 0;
            
            if (stackPos < 0) {
              // Flying out
              const flyOutU = Math.min(1, -stackPos);
              const flyX = flyOutU * -120; // fly left 120vw
              const flyRot = flyOutU * -15; // rotate slightly left
              cardTransform = `translate(calc(-50% + ${flyX}vw), -50%) scale(${1 + flyOutU * 0.1}) rotateZ(${flyRot}deg)`;
              cardOpacity = 1 - flyOutU;
            } else {
              // In stack
              const scaleVal = Math.max(0.8, 1 - stackPos * 0.05);
              const yOffset = stackPos * 30; // 30px down per card
              cardTransform = `translate(-50%, calc(-50% + ${yOffset}px)) scale(${scaleVal})`;
              cardOpacity = Math.max(0, 1 - stackPos * 0.3);
              contentOpacity = Math.max(0, 1 - stackPos * 2);
              cardBgOpacity = Math.min(0.95, stackPos);
            }
            
            card.style.transform = cardTransform;
            card.style.opacity = cardOpacity.toFixed(4);
            card.style.zIndex = zIndex;
            card.style.backgroundColor = `rgba(0, 0, 0, ${cardBgOpacity.toFixed(4)})`;
            const contentEl = card.querySelector('.prj-card-content');
            if (contentEl) {
              contentEl.style.opacity = contentOpacity.toFixed(4);
            }
          });
          listX = 0; // Ensure no horizontal scroll on mobile
        } else {
          // Desktop: Clear inline styles if resizing back to desktop
          getCards().forEach(card => {
            if (card.style.zIndex !== '') {
              card.style.transform = '';
              card.style.opacity = '';
              card.style.zIndex = '';
              card.style.backgroundColor = '';
              const contentEl = card.querySelector('.prj-card-content');
              if (contentEl) contentEl.style.opacity = '';
            }
          });
        }
      }

      if (sectionRef.current) {
        sectionRef.current.style.opacity       = opacity.toFixed(4);
        sectionRef.current.style.pointerEvents = pointerEvents;
        sectionRef.current.style.willChange    = 'opacity';
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `scale(${scale || 0})`;
        innerRef.current.style.willChange = 'transform';
      }
      if (listRef.current) {
        listRef.current.style.transform = `translateX(-${listX}px)`;
        listRef.current.style.willChange = 'transform';
      }
      if (viewportRef.current) {
        viewportRef.current.style.clipPath = `inset(0 ${clipAmt}vw 0 ${clipAmt}vw)`;
        viewportRef.current.style.willChange = 'clip-path';
      }
    };

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section id="projects" className="panel panel-projects" ref={sectionRef}>
      <div className="prj-inner" ref={innerRef}>

        {/* ── Background Bloom ── */}
        <div className="prj-bg-bloom" />

        {/* ── Header ── */}
        <div className="prj-header">
          <div className="prj-header-left">
            <span className="prj-chapter">CHAPTER IV</span>
            <h2 className="prj-heading">
              <span className="prj-hollow">MY</span>{' '}
              <span>PROJECTS</span>
            </h2>
          </div>
          
        </div>

        <div className="prj-header-rule-full" />

        {/* ── Project cards list ── */}
        <div className="prj-list-viewport" ref={viewportRef}>
          <div className="prj-list" ref={listRef}>
            {PROJECTS.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
