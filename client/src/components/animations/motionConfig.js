// ─────────────────────────────────────────────────────────────────────────────
//  CampusCart · Global Animation Configuration
//  Centralised motion tokens — used across every animated component
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing ──────────────────────────────────────────────────────────────────
export const ease = {
  out:      [0.16, 1, 0.3, 1],        // easeOutExpo  – snappy deceleration
  in:       [0.4, 0, 1, 0.6],         // easeInCubic
  inOut:    [0.76, 0, 0.24, 1],       // easeInOutQuart
  spring:   { type: 'spring', stiffness: 300, damping: 30 },
  springy:  { type: 'spring', stiffness: 400, damping: 20 },
};

// ── Duration tokens ──────────────────────────────────────────────────────────
export const dur = {
  xs:  0.2,
  sm:  0.35,
  md:  0.5,
  lg:  0.7,
  xl:  1.0,
};

// ── Stagger ──────────────────────────────────────────────────────────────────
export const staggerChildren = (delay = 0.1, from = 0) => ({
  transition: { staggerChildren: delay, delayChildren: from },
});

// ─────────────────────────────────────────────────────────────────────────────
//  VARIANT LIBRARY
// ─────────────────────────────────────────────────────────────────────────────

/** Fade + slide up — the universal reveal */
export const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.md, ease: ease.out } },
};

/** Fade + slide down (navbar) */
export const fadeDown = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.sm, ease: ease.out } },
};

/** Pure fade */
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: dur.md, ease: ease.out } },
};

/** Scale + fade — card entrance */
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1,    y: 0,
    transition: { duration: dur.md, ease: ease.out } },
};

/** Stagger container — wrap staggered children in this */
export const staggerContainer = (stagger = 0.1, delay = 0) => ({
  hidden:  {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Continuous float loop */
export const floatLoop = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
  },
};

export const floatLoopAlt = {
  animate: {
    y: [0, -8, 0],
    rotate: [0, 1, 0],
    transition: { duration: 5, ease: 'easeInOut', repeat: Infinity, delay: 1 },
  },
};

/** Scroll-based parallax helper — call inside useTransform */
export const parallaxConfig = { inputRange: [0, 1], outputRange: ['0%', '-15%'] };

/** Hero hero text line reveal */
export const lineReveal = {
  hidden:  { opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)' },
  visible: {
    opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)',
    transition: { duration: dur.lg, ease: ease.out },
  },
};

/** Glow pulse for borrow section highlight */
export const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(99,102,241,0.1)',
      '0 0 60px rgba(99,102,241,0.35)',
      '0 0 20px rgba(99,102,241,0.1)',
    ],
    transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
  },
};

/** Scroll indicator bounce */
export const scrollBounce = {
  animate: {
    y: [0, 8, 0],
    opacity: [0.6, 1, 0.6],
    transition: { duration: 1.5, ease: 'easeInOut', repeat: Infinity },
  },
};

/** Button press */
export const btnTap = { whileTap: { scale: 0.96 }, whileHover: { scale: 1.04 } };

/** Icon hover spin */
export const iconHover = { whileHover: { rotate: 15, scale: 1.15 } };

/** Card hover lift */
export const cardHover = {
  whileHover: {
    y: -8, scale: 1.02,
    boxShadow: '0 20px 60px rgba(99,102,241,0.25)',
    transition: { duration: dur.sm, ease: ease.out },
  },
};
