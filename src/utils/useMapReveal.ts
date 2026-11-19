import { useEffect, useRef } from 'react';

/** Reveal once per page mount, relative to the app's own scroll container. */
export function useMapReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reveal = () => {
      element.classList.remove('is-waiting');
      element.classList.add('is-revealed');
    };
    element.classList.add('is-waiting');
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        reveal();
        observer.disconnect();
      }
    }, { root: element.closest('.app-scroll'), threshold: 0.12 });
    observer.observe(element);
    const reduce = () => { if (motion.matches) { reveal(); observer.disconnect(); } };
    motion.addEventListener('change', reduce);
    return () => { observer.disconnect(); motion.removeEventListener('change', reduce); element.classList.remove('is-waiting'); };
  }, []);
  return ref;
}
