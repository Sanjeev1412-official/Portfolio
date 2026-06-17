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

      if (dist > 2600) {
        opacity = 0;
        scale = 0.05;
      } else if (dist > 0) {
        // Enter phase
        const u = dist / 2600;
        scale = 1 - Math.pow(u, 1.5) * 0.95;
        opacity = Math.pow(1 - u, 3);
        pointerEvents = dist < 1000 ? 'auto' : 'none';
      } else if (dist > -2000) {
        // Dwell — Horizontal scroll
        const u = Math.abs(dist) / 2000; // 0 -> 1
        scale = 1.0;
        opacity = 1.0;
        pointerEvents = 'auto';

        if (track1Ref.current && track2Ref.current) {
          const containerWidth = window.innerWidth * 0.9;
          const maxScroll1 = Math.max(0, track1Ref.current.scrollWidth - containerWidth);
          const maxScroll2 = Math.max(0, track2Ref.current.scrollWidth - containerWidth);
          const maxScroll = Math.max(maxScroll1, maxScroll2);

          const targetX = u * maxScroll;
          track1X = Math.min(targetX, maxScroll1);
          track2X = Math.min(targetX, maxScroll2);
        }
      } else if (dist > -4000) {
        // Exit — smooth zoom past camera
        const u = Math.abs(dist + 2000) / 2000; // 0 -> 1
        scale = 1.0 + Math.pow(u, 1.5) * 2.5;
        opacity = Math.max(0, 1 - Math.pow(u, 1.2));

        if (track1Ref.current && track2Ref.current) {
          const containerWidth = window.innerWidth * 0.9;
          const maxScroll1 = Math.max(0, track1Ref.current.scrollWidth - containerWidth);
          const maxScroll2 = Math.max(0, track2Ref.current.scrollWidth - containerWidth);

          track1X = maxScroll1;
          track2X = maxScroll2;
        }
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
