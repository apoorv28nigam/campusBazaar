/**
 * AnimatedSection — Reusable scroll-triggered section wrapper.
 *
 * Usage:
 *   <AnimatedSection>
 *     <YourContent />
 *   </AnimatedSection>
 *
 * Props:
 *   variant    – framer-motion variant object (default: fadeUp)
 *   threshold  – 0-1, how much of section must be visible (default: 0.2)
 *   delay      – extra initial delay in seconds (default: 0)
 *   className  – forwarded to motion.div
 *   style      – forwarded to motion.div
 */
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp } from './motionConfig';

export default function AnimatedSection({
  children,
  variant  = fadeUp,
  threshold = 0.2,
  delay    = 0,
  once     = false,
  className,
  style,
  as       = 'section',
}) {
  const ref    = useRef(null);
  const inView = useInView(ref, { amount: threshold, once });

  const v = delay
    ? {
        hidden:  variant.hidden,
        visible: {
          ...variant.visible,
          transition: { ...variant.visible?.transition, delay },
        },
      }
    : variant;

  const Tag = motion[as] ?? motion.section;

  return (
    <Tag
      ref={ref}
      variants={v}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
