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
 *
 * NOTE: We intentionally do NOT use useInView to toggle hidden/visible.
 * The old approach caused a race condition: if the user scrolled before the
 * IntersectionObserver fired (it's async), items would stay hidden forever.
 * Instead, items always animate in on mount — the stagger effect is preserved.
 */
import { motion } from 'framer-motion';
import { staggerContainer, scaleIn } from './motionConfig';

/* ── Container ─────────────────────────────────────────────────────────────── */
export function StaggerList({
  children,
  stagger       = 0.07,
  delayChildren = 0.1,
  className,
  style,
  as            = 'div',
}) {
  const Tag = motion[as] ?? motion.div;

  return (
    <Tag
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      animate="visible"
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
