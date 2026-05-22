/**
 * ScrollProgressBar — Thin gradient bar at very top of viewport.
 * Fills as user scrolls down the page.
 */
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  // Smoothed spring so progress bar doesn't jitter
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping:   30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{
        position:    'fixed',
        top:         0,
        left:        0,
        right:       0,
        height:      3,
        scaleX,
        originX:     0,
        zIndex:      9999,
        background:  'linear-gradient(90deg, var(--primary), var(--warning))',
        boxShadow:   '0 0 12px rgba(107, 79, 58, 0.4)',
      }}
    />
  );
}
