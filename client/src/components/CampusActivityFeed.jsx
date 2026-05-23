import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  RefreshCw,
  PlusCircle,
  ArrowLeftRight,
  MessageSquare,
} from 'lucide-react';

// ── Activity data ─────────────────────────────────────────────────────────────
const ACTIVITIES = [
  {
    id: 1,
    type: 'sold',
    avatar: 'AM',
    avatarBg: '#D4A574',
    text: 'Aman sold HC Verma Physics (Part 2)',
    tag: 'Hostel A · Books',
    time: '2 min ago',
  },
  {
    id: 2,
    type: 'borrowed',
    avatar: 'RK',
    avatarBg: '#91A88A',
    text: 'Riya borrowed a scientific calculator',
    tag: 'CSE Dept · Electronics',
    time: '5 min ago',
  },
  {
    id: 3,
    type: 'listed',
    avatar: 'VN',
    avatarBg: '#B08D74',
    text: 'Cycle listed near Hostel C',
    tag: 'Hostel C · Sports',
    time: '8 min ago',
  },
  {
    id: 4,
    type: 'requested',
    avatar: 'PS',
    avatarBg: '#8B9DC3',
    text: 'Laptop stand requested by CSE student',
    tag: 'CSE Dept · Furniture',
    time: '11 min ago',
  },
  {
    id: 5,
    type: 'sold',
    avatar: 'DM',
    avatarBg: '#C4956A',
    text: 'Someone saved ₹1,200 on semester books',
    tag: 'Library Block · Books',
    time: '14 min ago',
  },
  {
    id: 6,
    type: 'exchanged',
    avatar: 'SK',
    avatarBg: '#A0927B',
    text: 'Sneha exchanged lab coat for a study lamp',
    tag: 'Hostel B · Clothing',
    time: '18 min ago',
  },
  {
    id: 7,
    type: 'borrowed',
    avatar: 'AT',
    avatarBg: '#8FBA9A',
    text: 'Arjun borrowed a drawing kit for 2 days',
    tag: 'Arch Dept · Stationery',
    time: '22 min ago',
  },
  {
    id: 8,
    type: 'listed',
    avatar: 'PG',
    avatarBg: '#C67C7C',
    text: 'Mini fridge listed for ₹2,800',
    tag: 'Hostel D · Appliances',
    time: '25 min ago',
  },
];

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  sold: {
    icon: ShoppingBag,
    label: 'Sold',
    color: '#5E8C61',
    bg: 'rgba(94, 140, 97, 0.1)',
  },
  borrowed: {
    icon: RefreshCw,
    label: 'Borrowed',
    color: '#6B4F3A',
    bg: 'rgba(107, 79, 58, 0.1)',
  },
  listed: {
    icon: PlusCircle,
    label: 'Listed',
    color: '#C67C4E',
    bg: 'rgba(198, 124, 78, 0.1)',
  },
  requested: {
    icon: MessageSquare,
    label: 'Requested',
    color: '#8B9DC3',
    bg: 'rgba(139, 157, 195, 0.1)',
  },
  exchanged: {
    icon: ArrowLeftRight,
    label: 'Exchanged',
    color: '#A0927B',
    bg: 'rgba(160, 146, 123, 0.1)',
  },
};

// ── Card ─────────────────────────────────────────────────────────────────────
function ActivityCard({ activity, index }) {
  const cfg = TYPE_CONFIG[activity.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(107, 79, 58, 0.1)' }}
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'default',
        transition: 'box-shadow 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background tint */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: cfg.bg,
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row: avatar + type badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: activity.avatarBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '0.02em',
              flexShrink: 0,
            }}
          >
            {activity.avatar}
          </div>

          {/* Type chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 10px',
              borderRadius: 99,
              background: cfg.bg,
              fontSize: 11,
              fontWeight: 800,
              color: cfg.color,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Icon size={11} strokeWidth={2.5} />
            {cfg.label}
          </div>
        </div>

        {/* Timestamp */}
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontWeight: 500,
            opacity: 0.7,
          }}
        >
          {activity.time}
        </span>
      </div>

      {/* Activity text */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text)',
          lineHeight: 1.45,
          position: 'relative',
        }}
      >
        {activity.text}
      </p>

      {/* Tag */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-muted)',
          background: 'var(--bg)',
          padding: '4px 10px',
          borderRadius: 8,
          alignSelf: 'flex-start',
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: cfg.color,
            flexShrink: 0,
          }}
        />
        {activity.tag}
      </div>
    </motion.div>
  );
}

// ── Live pulse indicator ──────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <motion.span
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: '#5E8C61',
          }}
        />
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#5E8C61',
            display: 'inline-block',
            position: 'relative',
          }}
        />
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#5E8C61', letterSpacing: '0.04em' }}>
        LIVE
      </span>
    </span>
  );
}

// ── Section header update pulse ───────────────────────────────────────────────
function UpdatedPulse() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => (n + 1) % 999), 18000);
    return () => clearInterval(t);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={tick}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.35 }}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-muted)',
          opacity: 0.7,
        }}
      >
        updated just now
      </motion.span>
    </AnimatePresence>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CampusActivityFeed() {
  return (
    <section
      style={{
        padding: '100px 0',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 56 }}
        >
          {/* Live badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 16px',
              borderRadius: 99,
              background: 'rgba(94, 140, 97, 0.08)',
              border: '1px solid rgba(94, 140, 97, 0.18)',
              marginBottom: 20,
            }}
          >
            <LiveDot />
            <span
              style={{
                width: 1,
                height: 12,
                background: 'rgba(94, 140, 97, 0.25)',
                display: 'inline-block',
              }}
            />
            <UpdatedPulse />
          </div>

          <h2
            className="section-title"
            style={{ marginBottom: 10, letterSpacing: '-0.03em' }}
          >
            Recently on CampusBazaar
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.0625rem',
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            Real student activity happening across campus
          </p>
        </motion.div>

        {/* Activity grid */}
        <div
          className="activity-feed-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 18,
          }}
        >
          {ACTIVITIES.map((activity, i) => (
            <ActivityCard key={activity.id} activity={activity} index={i} />
          ))}
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1100px) {
          .activity-feed-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .activity-feed-grid {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 24px;
            gap: 16px !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; /* Firefox */
            padding-left: 16px;
            padding-right: 16px;
            margin-left: -16px; /* Offset parent padding for full-width scroll */
            margin-right: -16px;
          }
          .activity-feed-grid::-webkit-scrollbar {
            display: none; /* Safari/Chrome */
          }
          .activity-feed-grid > div {
            flex: 0 0 85%;
            scroll-snap-align: center;
          }
        }
      `}</style>
    </section>
  );
}
