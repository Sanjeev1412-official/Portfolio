import { useEffect, useRef } from 'react';

export function useIntersectionObserver(options = {}) {
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          
          // Optionally stagger children if requested
          if (entry.target.dataset.stagger === 'true') {
            const children = Array.from(entry.target.children);
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('in-view');
              }, index * 100);
            });
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px', ...options });

    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [options]);

  const setRef = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  return setRef;
}
