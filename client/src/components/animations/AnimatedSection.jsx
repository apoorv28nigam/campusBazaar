/**
 * AnimatedSection — Reusable scroll-triggered section wrapper.
 *
 * Uses whileInView (Framer Motion native) instead of the manual useInView +
 * animate pattern. whileInView correctly handles elements already in the
 * viewport on mount, avoiding the race condition that caused blank content.
 *
 * Props:
 *   variant    – framer-motion variant object (default: fadeUp)
 *   threshold  – 0-1, how much of section must be visible (default: 0.1)
 *   delay      – extra initial delay in seconds (default: 0)
 *   className  – forwarded to motion element
 *   style      – forwarded to motion element
 */
import { motion } from 'framer-motion';
import { fadeUp } from './motionConfig';

export default function AnimatedSection({
  children,
  variant   = fadeUp,
  threshold = 0.1,
  delay     = 0,
  className,
  style,
  as        = 'section',
}) {
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
      variants={v}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
