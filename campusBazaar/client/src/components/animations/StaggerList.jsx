/**
 * StaggerList — Wraps children in a stagger container.
 *
 * Usage:
 *   <StaggerList stagger={0.1} delayChildren={0.2}>
 *     {items.map(i => (
 *       <StaggerItem key={i.id}>
 *         <YourCard item={i} />
 *       </StaggerItem>
 *     ))}
 *   </StaggerList>
 */
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { staggerContainer, scaleIn } from './motionConfig';

/* ── Container ─────────────────────────────────────────────────────────────── */
export function StaggerList({
  children,
  stagger       = 0.1,
  delayChildren = 0.15,
  threshold     = 0.15,
  once          = false,
  className,
  style,
  as            = 'div',
}) {
  const ref    = useRef(null);
  const inView = useInView(ref, { amount: threshold, once });
  const Tag    = motion[as] ?? motion.div;

  return (
    <Tag
      ref={ref}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}

/* ── Individual item ────────────────────────────────────────────────────────── */
export function StaggerItem({
  children,
  variant   = scaleIn,
  className,
  style,
}) {
  return (
    <motion.div variants={variant} className={className} style={style}>
      {children}
    </motion.div>
  );
}
