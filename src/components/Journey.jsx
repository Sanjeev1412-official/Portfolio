import React, { useEffect, useRef } from 'react';
import { useScrollProgress } from '../hooks/ScrollContext';

function springStep(curr, vel, target, k, d, dt) {
  const f = (target - curr) * k;
  const newV = (vel + f * dt) * Math.pow(d, dt * 60);
  return { pos: curr + newV * dt, vel: newV };
}

const EDUCATION = [
  {
    year: '2023 – Present',
    title: 'B.Tech — Electronics And Communication',
    place: 'College Of Engineering Chengannur',
    marks: 'CGPA: In Progress',
    tag: 'ONGOING',
  },
  {
    year: '2021 – 2023',
    title: 'Higher Secondary (XII)',
    place: 'Nair Samajam Higher Secondary School',
    marks: '94% Aggregate',
    tag: 'COMPLETED',
  },
  {
    year: '2021',
    title: 'Secondary School (X)',
    place: 'Higher Secondary School Chettikulangara',
    marks: '100% (Full A+)',
    tag: 'COMPLETED',
  },
];

const EXPERIENCE = [
  {
    company: 'IEDC BOOTCAMP CEC',
    linkTag: 'cec/iedc-bootcamp-cec',
    roles: [
      {
        year: 'Jan 2026 – Present',
        title: 'Quality & Operations Lead',
        tags: ['Quality Assurance', 'Operations'],
      },
      {
        year: 'Jan 2025 – Jan 2026',
        title: 'Video Editor',
        tags: ['Video Editing'],
      },
    ],
  },
  {
    company: 'µLearn CHN',
    linkTag: 'cec/mulearn-chn',
    roles: [
      {
        year: 'Jan 2025 – Jan 2026',
        title: 'UI/UX IG Lead',
        tags: ['UI/UX', 'Leadership'],
      },
    ],
  },
  {
    company: 'ELEWAYTE',
    linkTag: 'org/elewayte',
    roles: [
      {
        year: 'Jul 2024 – Aug 2024',
        title: 'IOT Intern',
        tags: ['IOT', 'Projects'],
      },
    ],
  },
  {
    company: 'EDUNET FOUNDATION',
    linkTag: 'org/edunet',
    roles: [
      {
        year: 'Jun 2024 – jul 2024',
        title: 'AI & Cloud Intern',
        tags: ['AI & Cloud', 'Projects'],
      },
    ],
  },
  {
    company: 'Cognifyz Technologies',
    linkTag: 'org/cognifyz',
    roles: [
      {
        year: 'Jun 2024 – Jul 2024',
        title: 'WEB Development Intern',
        tags: ['Web Development', 'Projects'],
      },
    ],
  },
  {
    company: 'OASIS INFOBYTES',
    linkTag: 'org/oasis-infobytes',
    roles: [
      {
        year: 'Jun 2024 – Aug 2024',
        title: 'Python Programming Intern',
        tags: ['Python', 'Projects'],
      },
    ],
  },
  {
    company: 'EDUGRAPHY',
    linkTag: 'org/edugraphy',
    roles: [
      {
        year: 'Sept 2023 – Oct 2023',
        title: 'Social Media Designer',
        tags: ['Social Media', 'Design'],
      },
    ],
  },
];

/* ── Horizontal Education Node ─────────────────── */
function EduNode({ item, index, isLast }) {
  return (
    <div
      className="htl-node htl-node--edu htl-node--top"
      style={{ animationDelay: `${index * 0.14}s` }}
    >
      <div className="htl-node-half htl-node-half--top">
        <div className="htl-card-physics-wrapper">
          <div className="htl-card htl-card--top">
            <span className="htl-year">{item.year}</span>
            <h4 className="htl-title">{item.title}</h4>
            <div className="htl-place">{item.place}</div>
            {item.marks && (
              <div className="htl-marks-badge">
                <span className="htl-marks-num">{item.marks}</span>
              </div>
            )}
            <span className="htl-tag">{item.tag}</span>
          </div>
        </div>
      </div>

      <div className="htl-stem htl-stem--edu">
        <div className="htl-dot" />
      </div>
    </div>
  );
}

/* ── Horizontal Experience Node ───────────────── */
function ExpNode({ group, index }) {
  return (
    <div
      className="htl-node htl-node--exp htl-node--bottom"
      style={{ animationDelay: `${index * 0.14}s` }}
    >
      <div className="htl-stem htl-stem--exp">
        <div className="htl-dot htl-dot--gold" />
      </div>

      <div className="htl-node-half htl-node-half--bottom">
        <div className="htl-card-physics-wrapper">
          <div className="htl-card htl-card--bottom htl-card--exp">
            <h4 className="htl-company">{group.company}</h4>
            <div className="htl-roles">
              {group.roles.map((role, ri) => (
                <div key={ri} className={`htl-role ${ri === 0 ? 'htl-role--active' : ''}`}>
                  <span className="htl-role-title">{role.title}</span>
                  <span className="htl-role-year">{role.year}</span>
                  <div className="htl-tags">
                    {role.tags.map((t, ti) => (
                      <span key={ti} className="htl-exp-tag">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { PhysicsStore } from '../hooks/ScrollContext';

export default function Journey() {
  const { progress } = useScrollProgress();
  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const track1Ref = useRef(null);
  const track2Ref = useRef(null);

  useEffect(() => {
    let animId;
    let track1Nodes = null;
    let track2Nodes = null;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const camZ = PhysicsStore.camZ;
      const SECTION_Z = 5000;
      const dist = SECTION_Z - camZ.pos;

      let opacity = 0;
      let scale = 0;
      let pointerEvents = 'none';
      let track1X = 0;
      let track2X = 0;
      let maxScroll1 = 0;
      let maxScroll2 = 0;

      if (track1Ref.current && track2Ref.current) {
        const W = window.innerWidth;
        const step = 320 + W * 0.04;
        const startOffset = W * 0.04 + 145;
        // targetViewportX ensures the last card docks right near the rail fade out (rightThreshold is W * 0.65)
        const targetViewportX = W * 0.64;

        const getTargetMaxScroll = (trackRef) => {
          const numCards = trackRef.current.children.length;
          if (numCards === 0) return 0;
          
          // If the entire track fits comfortably within the screen, no scroll needed.
          const containerWidth = window.innerWidth * 0.9;
          if (trackRef.current.scrollWidth <= containerWidth) {
            return 0;
          }
          
          const lastNodeLeft = (numCards - 1) * step;
          return Math.max(0, startOffset + lastNodeLeft - targetViewportX);
        };

        maxScroll1 = getTargetMaxScroll(track1Ref);
        maxScroll2 = getTargetMaxScroll(track2Ref);
      }

      if (dist > 2600) {
        opacity = 0;
        scale = 0.05;
      } else if (dist > 0) {
        // Enter phase
        const u = dist / 2600;
        scale = 1 - Math.pow(u, 1.5) * 0.95;
        opacity = Math.pow(1 - u, 3);
        pointerEvents = dist < 1000 ? 'auto' : 'none';
      } else if (dist > -2500) {
        // Dwell — Horizontal scroll (scrolls from 0 to -2000, then pauses from -2000 to -2500)
        const scrollDist = Math.min(Math.abs(dist), 2000);
        const u = scrollDist / 2000; // 0 -> 1
        
        scale = 1.0;
        opacity = 1.0;
        pointerEvents = 'auto';

        const maxScroll = Math.max(maxScroll1, maxScroll2);
        const targetX = u * maxScroll;
        track1X = Math.min(targetX, maxScroll1);
        track2X = Math.min(targetX, maxScroll2);
      } else if (dist > -4500) {
        // Exit — smooth zoom past camera
        const exitDist = Math.abs(dist + 2500);
        const u = exitDist / 2000; // 0 -> 1
        scale = 1.0 + Math.pow(u, 1.5) * 2.5;
        opacity = Math.max(0, 1 - Math.pow(u, 1.2));

        track1X = maxScroll1;
        track2X = maxScroll2;
      } else {
        opacity = 0;
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
      if (track1Ref.current) {
        track1Ref.current.style.transform = `translateX(-${track1X}px)`;
        track1Ref.current.style.willChange = 'transform';
      }
      if (track2Ref.current) {
        track2Ref.current.style.transform = `translateX(-${track2X}px)`;
        track2Ref.current.style.willChange = 'transform';
      }

      // Physics / Floating / Docking Animations for individual cards
      if (!track1Nodes && track1Ref.current) {
        track1Nodes = Array.from(track1Ref.current.children).map((node) => ({
          cardWrapper: node.querySelector('.htl-card-physics-wrapper'),
          stem: node.querySelector('.htl-stem'),
          dot: node.querySelector('.htl-dot'),
        }));
      }
      if (!track2Nodes && track2Ref.current) {
        track2Nodes = Array.from(track2Ref.current.children).map((node) => ({
          cardWrapper: node.querySelector('.htl-card-physics-wrapper'),
          stem: node.querySelector('.htl-stem'),
          dot: node.querySelector('.htl-dot'),
        }));
      }

      const updateNodes = (nodesData, trackX, maxScroll, isTop) => {
        if (!nodesData) return;
        const W = window.innerWidth;
        const nodeWidth = 320;
        const gap = W * 0.04;
        const step = nodeWidth + gap;
        const startOffset = W * 0.04 + 145;

        // Boundaries for docking zone
        const leftThreshold = 130; // Start detaching when moving past the HUD badge area
        const rightThreshold = W * 0.65;
        const transitionRange = 350; // Distance over which transition occurs

        // Only animate if the section has scrollable overflow.
        // We keep this active at all times so that during the Entry Zoom, overflow cards are floating in space waiting to dock,
        // and during the Exit Zoom, left cards hold their fallen state.
        const isMovingRail = maxScroll > 5;

        nodesData.forEach((item, i) => {
          if (!isMovingRail) {
            // Reset to defaults
            if (item.cardWrapper) {
              item.cardWrapper.style.transform = '';
              item.cardWrapper.style.opacity = '';
            }
            if (item.stem) {
              item.stem.style.opacity = '';
              item.stem.style.transform = '';
            }
            if (item.dot) {
              item.dot.style.opacity = '';
              item.dot.style.transform = '';
            }
            return;
          }

          const nodeLeft = i * step;
          const viewportX = startOffset + nodeLeft - trackX;

          let tx = 0;
          let ty = 0;
          let rot = 0;
          let sc = 1;
          let op = 1;
          let stemOp = 1;
          let dotOp = 1;

          if (viewportX < leftThreshold) {
            // Detach and drift into space (left side)
            const fallProgress = Math.min(1, Math.max(0, (leftThreshold - viewportX) / transitionRange));
            // Power curve: slow break away from rail, accelerating into deep space
            const easedFall = Math.pow(fallProgress, 2.5); 

            tx = easedFall * -120; // Drift leftwards
            ty = easedFall * (isTop ? -280 : 280); // Float up/down into the void
            rot = easedFall * (isTop ? -45 : 45); // Tumble rotation
            sc = 1 - (easedFall * 0.4); // Shrink away
            op = Math.max(0, 1 - Math.pow(fallProgress, 1.2)); // Smooth fade
            
            stemOp = Math.max(0, 1 - fallProgress * 1.2); 
            dotOp = Math.max(0, 1 - fallProgress * 1.2);
          } else if (viewportX > rightThreshold) {
            // Fly in from space and magnetic dock (right side)
            const flyProgress = Math.min(1, Math.max(0, (viewportX - rightThreshold) / transitionRange));
            // Power curve: sweeps in fast, then perfectly decelerates into the dock
            const easedFly = Math.pow(flyProgress, 2.5); 

            tx = easedFly * 150; // Sweep in from right
            ty = easedFly * (isTop ? -300 : 300); // Float in from deep above/below
            rot = easedFly * (isTop ? 50 : -50); // Tumble into alignment
            sc = 1 - (easedFly * 0.45); // Grow from small
            op = Math.max(0, 1 - Math.pow(flyProgress, 1.2)); // Smooth fade
            
            stemOp = Math.max(0, 1 - flyProgress * 1.2);
            dotOp = Math.max(0, 1 - flyProgress * 1.2);
          }

          // Apply styles
          if (item.cardWrapper) {
            item.cardWrapper.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(${sc})`;
            item.cardWrapper.style.opacity = op.toFixed(4);
          }
          if (item.stem) {
            item.stem.style.opacity = stemOp.toFixed(4);
            if (isTop) {
              item.stem.style.transform = `translate3d(${tx}px, ${ty}px, 0) scaleY(${stemOp})`;
              item.stem.style.transformOrigin = 'bottom center';
            } else {
              item.stem.style.transform = `translate3d(${tx}px, ${ty}px, 0) scaleY(${stemOp})`;
              item.stem.style.transformOrigin = 'top center';
            }
          }
          if (item.dot) {
            item.dot.style.opacity = dotOp.toFixed(4);
            item.dot.style.transform = `translate(-50%, -50%) translate3d(${tx}px, ${ty}px, 0) scale(${sc})`;
          }
        });
      };

      updateNodes(track1Nodes, track1X, maxScroll1, true);
      updateNodes(track2Nodes, track2X, maxScroll2, false);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section id="journey" className="panel panel-journey" ref={sectionRef}>
      <div className="journey-inner" ref={innerRef}>

        {/* ── Section Header ──────────────────────────── */}
        <div className="journey-header">
          <span className="journey-label">CHAPTER II</span>
          <h2 className="journey-heading">
            <span className="jh-hollow">MY</span>{' '}
            <span>JOURNEY</span>
          </h2>
          <div className="journey-header-rule" />
        </div>

        {/* ── EDUCATION horizontal timeline ─────────── */}
        <div className="htl-section">
          <div className="htl-track-wrap">
            <div className="htl-section-label htl-section-label--edu">
              <span className="htl-section-icon">◎</span>
              <span className="htl-section-title">EDUCATION</span>
            </div>
            {/* The continuous rail */}
            <div className="htl-rail" />
            <div className="htl-nodes" ref={track1Ref}>
              {EDUCATION.map((item, i) => (
                <EduNode key={i} item={item} index={i} isLast={i === EDUCATION.length - 1} />
              ))}
            </div>
          </div>
        </div>

        {/* ── EXPERIENCE horizontal timeline ─────────── */}
        <div className="htl-section">
          <div className="htl-track-wrap">
            <div className="htl-section-label htl-section-label--exp">
              <span className="htl-section-icon">◉</span>
              <span className="htl-section-title">EXPERIENCE</span>
            </div>
            <div className="htl-rail htl-rail--gold htl-rail--bottom" />
            <div className="htl-nodes htl-nodes--bottom" ref={track2Ref}>
              {EXPERIENCE.map((group, i) => (
                <ExpNode key={i} group={group} index={i} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
