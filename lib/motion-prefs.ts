'use client';

import { useReducedMotion } from 'framer-motion';

/** Shared scroll-reveal presets that respect `prefers-reduced-motion`. */
export function useScrollRevealMotion() {
  const reduced = useReducedMotion();

  return {
    /** Alias for `useReducedMotion()` — prefer destructuring `reduced` from this hook */
    reduced,
    offscreen: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    onscreen: { opacity: 1, y: 0 },
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    transitionShort: reduced ? { duration: 0 } : { duration: 0.5 },
    staggerDelay: (index: number, stepSec = 0.1) => (reduced ? 0 : index * stepSec),
  };
}
