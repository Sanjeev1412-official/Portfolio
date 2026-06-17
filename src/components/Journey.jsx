import React, { useState, useEffect, useRef } from 'react';
import { useScrollProgress, PhysicsStore } from '../hooks/ScrollContext';

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

const COMBINED = (() => {
  const stepEduY = 180;
  const stepExpY = 145;
  let currentY = 0;
  const list = [];

  // Index 0: EDUCATION separator
  list.push({ isSeparator: true, isEduSep: true, title: 'EDUCATION', id: 'sep-edu', y: currentY });

  // Index 1, 2, 3: Education cards
  EDUCATION.forEach((item, index) => {
    currentY += (index === 0 ? 145 : stepEduY);
    list.push({ ...item, isEdu: true, id: `edu-${index}`, y: currentY });
  });

  // Index 4: EXPERIENCE separator
  currentY += stepEduY;
  list.push({ isSeparator: true, isEduSep: false, title: 'EXPERIENCE', id: 'sep-exp', y: currentY });

  // Index 5 to 11: Experience cards
  EXPERIENCE.forEach((item, index) => {
    currentY += (index === 0 ? 145 : stepExpY);
    list.push({ ...item, isEdu: false, id: `exp-${index}`, y: currentY });
  });

  return list;
})();

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



export default function Journey() {
  const { progress } = useScrollProgress();
  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const track1Ref = useRef(null);
  const track2Ref = useRef(null);

  // Mobile layout refs
  const mobileContainerRef = useRef(null);
  const mobileTrackRef = useRef(null);
  const mobileRailSilverRef = useRef(null);
  const mobileRailGoldRef = useRef(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [currSection, setCurrSection] = useState('edu');
  const lastSectionRef = useRef('edu');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let animId;
    let track1Nodes = null;
    let track2Nodes = null;
    let mobileNodes = null;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const camZ = PhysicsStore.camZ;
      const SECTION_Z = 5000;
      const dist = SECTION_Z - camZ.pos;

      // Determine mobile inside animation loop dynamically so that resizing doesn't break animation reference bindings
      const checkIsMobile = window.innerWidth <= 768;

      let opacity = 0;
      let scale = 0;
      let pointerEvents = 'none';

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
        // Dwell — Horizontal/Vertical scroll
        scale = 1.0;
        opacity = 1.0;
        pointerEvents = 'auto';
      } else if (dist > -4500) {
        // Exit — smooth zoom past camera
        const exitDist = Math.abs(dist + 2500);
        const u = exitDist / 2000; // 0 -> 1
        scale = 1.0 + Math.pow(u, 1.5) * 2.5;
        opacity = Math.max(0, 1 - Math.pow(u, 1.2));
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

      let scrollProgress = 0;
      if (dist > 0) {
        scrollProgress = 0;
      } else if (dist > -2000) {
        scrollProgress = Math.abs(dist) / 2000;
      } else {
        scrollProgress = 1.0;
      }

      if (checkIsMobile) {
        // --- MOBILE ANIMATION LOGIC ---
        if (mobileTrackRef.current) {
          const H = window.innerHeight;
          const stepExpY = 145;
          const startOffsetY = H * 0.19;
          const topThreshold = H * 0.18;
          const bottomThreshold = startOffsetY + 2.8 * stepExpY;
          const transitionRange = 100;

          const numCards = COMBINED.length;
          const maxScrollY = Math.max(0, COMBINED[numCards - 1].y - 1.8 * stepExpY);
          const translateY = scrollProgress * maxScrollY;

          mobileTrackRef.current.style.transform = `translateY(${startOffsetY - translateY}px)`;
          mobileTrackRef.current.style.willChange = 'transform';

          // Blend silver and gold rail opacity dynamically
          const silverOp = Math.max(0, Math.min(1, 1.3 - scrollProgress * 2.0));
          const goldOp = Math.max(0, Math.min(1, scrollProgress * 2.0 - 0.3));

          if (mobileRailSilverRef.current) {
            mobileRailSilverRef.current.style.opacity = silverOp.toFixed(4);
          }
          if (mobileRailGoldRef.current) {
            mobileRailGoldRef.current.style.opacity = goldOp.toFixed(4);
          }

          // Dynamically toggle Education / Experience indicator badge
          const newSection = scrollProgress < 0.3 ? 'edu' : 'exp';
          if (newSection !== lastSectionRef.current) {
            lastSectionRef.current = newSection;
            setCurrSection(newSection);
          }

          // Cache mobile nodes if not cached
          if (!mobileNodes) {
            mobileNodes = Array.from(mobileTrackRef.current.children).map((node, idx) => ({
              wrapper: node.querySelector('.vtl-node-physics-wrapper') || node.querySelector('.vtl-separator-physics-wrapper'),
              y: COMBINED[idx].y,
            }));
          }

          // Update mobile nodes physics
          mobileNodes.forEach((node, i) => {
            if (!node.wrapper) return;

            const nodeY = node.y;
            const viewportY = startOffsetY + nodeY - translateY;

            let tx = 0;
            let ty = 0;
            let rot = 0;
            let sc = 1;
            let op = 1;

            if (viewportY < topThreshold) {
              // Fly out (top)
              const progress = Math.min(1, Math.max(0, (topThreshold - viewportY) / transitionRange));
              const eased = Math.pow(progress, 2.5);
              tx = eased * -80; // drift left
              ty = eased * -150; // drift up
              rot = eased * -30; // tumble
              sc = 1 - eased * 0.4; // shrink
              op = Math.max(0, 1 - Math.pow(progress, 1.2)); // fade
            } else if (viewportY > bottomThreshold) {
              // Dock in (bottom)
              const progress = Math.min(1, Math.max(0, (viewportY - bottomThreshold) / transitionRange));
              const eased = Math.pow(progress, 2.5);
              tx = eased * 100; // sweep from right
              ty = eased * 150; // float from bottom
              rot = eased * 35; // tumble
              sc = 1 - eased * 0.45; // grow from small
              op = Math.max(0, 1 - Math.pow(progress, 1.2)); // fade
            }

            node.wrapper.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(${sc})`;
            node.wrapper.style.opacity = op.toFixed(4);
          });
        }
      } else {
        // --- DESKTOP ANIMATION LOGIC (UNCHANGED) ---
        let track1X = 0;
        let track2X = 0;
        let maxScroll1 = 0;
        let maxScroll2 = 0;

        if (track1Ref.current && track2Ref.current) {
          const W = window.innerWidth;
          const step = 320 + W * 0.04;
          const startOffset = W * 0.04 + 145;
          const targetViewportX = W * 0.64;

          const getTargetMaxScroll = (trackRef) => {
            const numCards = trackRef.current.children.length;
            if (numCards === 0) return 0;
            
            const containerWidth = window.innerWidth * 0.9;
            if (trackRef.current.scrollWidth <= containerWidth) {
              return 0;
            }
            
            const lastNodeLeft = (numCards - 1) * step;
            return Math.max(0, startOffset + lastNodeLeft - targetViewportX);
          };

          maxScroll1 = getTargetMaxScroll(track1Ref);
          maxScroll2 = getTargetMaxScroll(track2Ref);

          const maxScroll = Math.max(maxScroll1, maxScroll2);
          const targetX = scrollProgress * maxScroll;
          track1X = Math.min(targetX, maxScroll1);
          track2X = Math.min(targetX, maxScroll2);
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

          const leftThreshold = 130;
          const rightThreshold = W * 0.65;
          const transitionRange = 350;

          const isMovingRail = maxScroll > 5;

          nodesData.forEach((item, i) => {
            if (!isMovingRail) {
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
              const fallProgress = Math.min(1, Math.max(0, (leftThreshold - viewportX) / transitionRange));
              const easedFall = Math.pow(fallProgress, 2.5); 

              tx = easedFall * -120;
              ty = easedFall * (isTop ? -280 : 280);
              rot = easedFall * (isTop ? -45 : 45);
              sc = 1 - (easedFall * 0.4);
              op = Math.max(0, 1 - Math.pow(fallProgress, 1.2));
              
              stemOp = Math.max(0, 1 - fallProgress * 1.2); 
              dotOp = Math.max(0, 1 - fallProgress * 1.2);
            } else if (viewportX > rightThreshold) {
              const flyProgress = Math.min(1, Math.max(0, (viewportX - rightThreshold) / transitionRange));
              const easedFly = Math.pow(flyProgress, 2.5); 

              tx = easedFly * 150;
              ty = easedFly * (isTop ? -300 : 300);
              rot = easedFly * (isTop ? 50 : -50);
              sc = 1 - (easedFly * 0.45);
              op = Math.max(0, 1 - Math.pow(flyProgress, 1.2));
              
              stemOp = Math.max(0, 1 - flyProgress * 1.2);
              dotOp = Math.max(0, 1 - flyProgress * 1.2);
            }

            if (item.cardWrapper) {
              item.cardWrapper.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(${sc})`;
              item.cardWrapper.style.opacity = op.toFixed(4);
            }
            if (item.stem) {
              item.stem.style.opacity = stemOp.toFixed(4);
              item.stem.style.transform = `translate3d(${tx}px, ${ty}px, 0) scaleY(${stemOp})`;
              item.stem.style.transformOrigin = isTop ? 'bottom center' : 'top center';
            }
            if (item.dot) {
              item.dot.style.opacity = dotOp.toFixed(4);
              item.dot.style.transform = `translate(-50%, -50%) translate3d(${tx}px, ${ty}px, 0) scale(${sc})`;
            }
          });
        };

        updateNodes(track1Nodes, track1X, maxScroll1, true);
        updateNodes(track2Nodes, track2X, maxScroll2, false);
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

        {isMobile ? (
          /* ── MOBILE combined vertical timeline ────────── */
          <div className="vtl-section">
            {currSection === 'edu' ? (
              <div className="htl-section-label htl-section-label--edu htl-section-label--mobile">
                <span className="htl-section-icon">◎</span>
                <span className="htl-section-title">EDUCATION</span>
              </div>
            ) : (
              <div className="htl-section-label htl-section-label--exp htl-section-label--mobile">
                <span className="htl-section-icon">◉</span>
                <span className="htl-section-title">EXPERIENCE</span>
              </div>
            )}
            <div className="vtl-container" ref={mobileContainerRef}>
              <div className="vtl-rail-silver" ref={mobileRailSilverRef} />
              <div className="vtl-rail-gold" ref={mobileRailGoldRef} />
              <div className="vtl-track" ref={mobileTrackRef}>
                {COMBINED.map((item, i) => (
                  <div
                    key={item.id}
                    className={`vtl-node vtl-node--${item.isSeparator ? (item.isEduSep ? 'edu' : 'exp') : (item.isEdu ? 'edu' : 'exp')}`}
                    style={{
                      position: 'absolute',
                      top: `${item.y}px`,
                      height: '145px',
                      width: '100%',
                    }}
                  >
                    {item.isSeparator ? (
                      <div className="vtl-separator-physics-wrapper">
                        <div className={`vtl-separator-dot ${item.isEduSep ? 'vtl-separator-dot--silver' : ''}`} />
                        <div className={`vtl-separator-stem ${item.isEduSep ? 'vtl-separator-stem--silver' : ''}`} />
                        <div className={`vtl-separator-badge ${item.isEduSep ? 'vtl-separator-badge--silver' : ''}`}>
                          <span className="vtl-separator-icon">{item.isEduSep ? '◎' : '◉'}</span>
                          <span className="vtl-separator-title">{item.title}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="vtl-node-physics-wrapper">
                        <div className={`vtl-dot ${item.isEdu ? '' : 'vtl-dot--gold'}`} />
                        <div className={`vtl-stem ${item.isEdu ? '' : 'vtl-stem--gold'}`} />
                        <div className="vtl-card-wrap">
                          <div className={`htl-card ${item.isEdu ? 'htl-card--top' : 'htl-card--bottom htl-card--exp'}`}>
                            {item.isEdu ? (
                              <>
                                <span className="htl-year">{item.year}</span>
                                <h4 className="htl-title">{item.title}</h4>
                                <div className="htl-place">{item.place}</div>
                                {item.marks && (
                                  <div className="htl-marks-badge">
                                    <span className="htl-marks-num">{item.marks}</span>
                                  </div>
                                )}
                                <span className="htl-tag">{item.tag}</span>
                              </>
                            ) : (
                              <>
                                <h4 className="htl-company">{item.company}</h4>
                                <div className="htl-roles">
                                  {item.roles.map((role, ri) => (
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
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── DESKTOP dual horizontal rails (UNCHANGED) ── */
          <>
            <div className="htl-section">
              <div className="htl-track-wrap">
                <div className="htl-section-label htl-section-label--edu">
                  <span className="htl-section-icon">◎</span>
                  <span className="htl-section-title">EDUCATION</span>
                </div>
                <div className="htl-rail" />
                <div className="htl-nodes" ref={track1Ref}>
                  {EDUCATION.map((item, i) => (
                    <EduNode key={i} item={item} index={i} isLast={i === EDUCATION.length - 1} />
                  ))}
                </div>
              </div>
            </div>

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
          </>
        )}

      </div>
    </section>
  );
}
