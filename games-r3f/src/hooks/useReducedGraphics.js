import { useEffect, useState } from 'react';

/**
 * Detects whether the device should run the "heavy" render path
 * (postprocessing + extra bokeh). Returns `true` on devices that should
 * STRIP those effects to keep the games fluid.
 *
 * Criteria (any one triggers reduced mode):
 * - coarse pointer (touch)
 * - viewport width < 820 px
 * - navigator.hardwareConcurrency <= 4
 * - user prefers reduced motion
 */
export default function useReducedGraphics() {
  const [reduced, setReduced] = useState(() => check());

  useEffect(() => {
    const onResize = () => setReduced(check());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return reduced;
}

function check() {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  const small = window.innerWidth < 820;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return !!(coarse || small || fewCores || prefersReduced);
}
