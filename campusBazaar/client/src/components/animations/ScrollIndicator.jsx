/**
 * ScrollIndicator — Bouncing chevron indicator in Hero section.
 * Clicking it smooth-scrolls to the first section below the hero.
 *
 * Props:
 *   targetId  – id of the element to scroll to (default: 'stats-section')
 */
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { scrollBounce } from './motionConfig';

export default function ScrollIndicator({ targetId = 'stats-section' }) {
  const handleClick = () => {
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.button
      onClick={handleClick}
      variants={scrollBounce}
      animate="animate"
      aria-label="Scroll down"
      style={{
        position:       'absolute',
        bottom:         32,
        left:           '50%',
        transform:      'translateX(-50%)',
        background:     'rgba(255,255,255,0.06)',
        border:         '1px solid rgba(255,255,255,0.15)',
        borderRadius:   '50%',
        width:          44,
        height:         44,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        color:          '#94a3b8',
        zIndex:         10,
        backdropFilter: 'blur(8px)',
      }}
    >
      <ChevronDown size={20} />
    </motion.button>
  );
}
