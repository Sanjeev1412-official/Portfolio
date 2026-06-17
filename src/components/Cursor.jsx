import React, { useEffect, useRef } from 'react';

export default function Cursor() {
  const cursorRef = useRef(null);
  const trailRef = useRef(null);
  
  // Use mutable refs for animation state to avoid re-renders
  const pos = useRef({
    cursorX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    cursorY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    trailX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    trailY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      pos.current.cursorX = e.clientX;
      pos.current.cursorY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    const lerp = (a, b, t) => a + (b - a) * t;

    const render = () => {
      pos.current.trailX = lerp(pos.current.trailX, pos.current.cursorX, 0.15);
      pos.current.trailY = lerp(pos.current.trailY, pos.current.cursorY, 0.15);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.cursorX}px, ${pos.current.cursorY}px, 0)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${pos.current.trailX}px, ${pos.current.trailY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Hover effects for interactive elements
    const handleHover = () => {
      if (cursorRef.current) cursorRef.current.classList.add('hover');
      if (trailRef.current) trailRef.current.classList.add('hover');
    };

    const handleHoverOut = () => {
      if (cursorRef.current) cursorRef.current.classList.remove('hover');
      if (trailRef.current) trailRef.current.classList.remove('hover');
    };

    const bindLinks = () => {
      const interactables = document.querySelectorAll('a, button, .project-row, .nav-logo');
      interactables.forEach(el => {
        el.addEventListener('mouseenter', handleHover);
        el.addEventListener('mouseleave', handleHoverOut);
      });
    };

    // Need a slight delay to ensure DOM is ready
    const timeout = setTimeout(bindLinks, 500);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeout);
      const interactables = document.querySelectorAll('a, button, .project-row, .nav-logo');
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', handleHover);
        el.removeEventListener('mouseleave', handleHoverOut);
      });
    };
  }, []);

  return (
    <>
      <div id="custom-cursor" ref={cursorRef}></div>
      <div id="cursor-trail" ref={trailRef}></div>
    </>
  );
}
