import { Link } from 'react-router-dom';
import {
  ShoppingBag, RefreshCw, Star, ArrowRight,
  CheckCircle, ChevronRight, Laptop, Calculator, Bike, BookOpen
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// ── Animation helpers ────────────────────────────────────────────────────────
import AnimatedSection from '../components/animations/AnimatedSection';
import { StaggerList, StaggerItem } from '../components/animations/StaggerList';
import ScrollIndicator from '../components/animations/ScrollIndicator';
import {
  fadeUp, fadeDown, fadeIn, scaleIn, lineReveal,
  floatLoop, floatLoopAlt, glowPulse, staggerContainer,
  btnTap, ease, dur,
} from '../components/animations/motionConfig';

// ── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Books', color: 'var(--primary)', bg: 'rgba(107, 79, 58, 0.08)' },
  { name: 'Electronics', color: 'var(--warning)', bg: 'rgba(198, 124, 78, 0.08)' },
  { name: 'Clothing', color: '#8B5E3C', bg: 'rgba(139, 94, 60, 0.08)' },
  { name: 'Furniture', color: 'var(--success)', bg: 'rgba(94, 140, 97, 0.08)' },
  { name: 'Sports', color: '#91A88A', bg: 'rgba(145, 168, 138, 0.08)' },
  { name: 'Stationery', color: '#B08D74', bg: 'rgba(176, 141, 116, 0.08)' },
  { name: 'Free Items', color: 'var(--success)', bg: 'rgba(94, 140, 97, 0.08)' },
  { name: 'Other', color: 'var(--text-muted)', bg: 'rgba(130, 113, 100, 0.08)' },
];

const TESTIMONIALS = [
  { name: 'Apoorv Nigam', college: 'GLBITM', text: 'Found a calculator for my exams for just ₹200! Seller was from my hostel. Amazing experience!', rating: 5, avatar: 'PS' },
  { name: 'Amit Singh', college: 'GLBITM', text: 'Sold my old laptop within 2 hours! CampusCart is incredible — no haggling with strangers.', rating: 5, avatar: 'RM' },
  { name: 'Utkarsh', college: 'GLBITM', text: 'Borrowed a projector for my presentation for just ₹150/day. Saved so much money!', rating: 5, avatar: 'AS' },
];

const HOW_IT_WORKS_STEPS = [
  { title: 'Create Your Account', desc: 'Sign up with your college email to join your campus community. Verify your student status instantly.', color: 'var(--primary)' },
  { title: 'Browse or List Items', desc: 'Browse items listed by your campus mates, or list your own items to sell or lend in seconds.', color: 'var(--warning)' },
  { title: 'Chat & Transact Safely', desc: 'Chat directly, pay securely, and meet on campus. No strangers, only verified students!', color: 'var(--success)' },
];

// ── Page-load sequence timings ───────────────────────────────────────────────
const PAGE_LOAD = {
  bg: { delay: 0 },
  badge: { delay: 0.2 },
  heading1: { delay: 0.3 },
  heading2: { delay: 0.45 },
  subtitle: { delay: 0.55 },
  cta: { delay: 0.7 },
  trust: { delay: 0.85 },
  card1: { delay: 0.4 },
  card2: { delay: 0.6 },
  badge2: { delay: 0.8 },
};


// ── Redesigned Borrow Section Components ─────────────────────────────────────
const BORROW_ITEMS = [
  {
    id: 1,
    title: 'High-End Laptop',
    price: '₹500/Day',
    icon: Laptop,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    badge: 'Available Now',
    featured: true,
    desc: 'Power for your heavy projects and assignments.'
  },
  {
    id: 3,
    title: 'Campus Cycle',
    price: '₹50/Day',
    icon: Bike,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    badge: 'Available',
    desc: 'Perfect for quick campus commutes.'
  },
  {
    id: 4,
    title: 'Academic Books',
    price: '₹10/Day',
    icon: BookOpen,
    iconBg: '#fdf2f8',
    iconColor: '#db2777',
    badge: 'Verified',
    desc: 'Sem 4 Engineering textbooks.'
  },
  {
    id: 5,
    title: 'Sports Shoes',
    price: '₹30/Day',
    icon: ShoppingBag,
    iconBg: '#fff7ed',
    iconColor: '#ea580c',
    badge: 'Available',
    desc: 'Size 9, comfortable for football.'
  }
];

function BorrowProductCard({ item }) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.02,
        boxShadow: '0 30px 60px -12px rgba(107, 79, 58, 0.15), 0 18px 36px -18px rgba(107, 79, 58, 0.2)'
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'white',
        borderRadius: 24,
        padding: item.featured ? 32 : 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        border: '1px solid rgba(139, 94, 60, 0.05)',
        position: 'relative',
        gridColumn: item.featured ? 'span 2' : 'span 1',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Floating Background Hint */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: item.iconBg,
        opacity: 0.4,
        filter: 'blur(40px)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: item.featured ? 24 : 16 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#16a34a',
            padding: '4px 10px',
            borderRadius: 99
          }}>
            {item.badge}
          </span>
        </div>

        <h3 style={{ fontSize: item.featured ? 24 : 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
          {item.title}
        </h3>

        {item.desc && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: item.featured ? 20 : 12, lineHeight: 1.5 }}>
            {item.desc}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{item.price.split('/')[0]}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>/{item.price.split('/')[1]}</span>
        </div>
      </div>

      <div style={{ marginTop: item.featured ? 32 : 20, position: 'relative', zIndex: 1 }}>
        <Link to="/borrow" style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 12,
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 4px 12px rgba(107, 79, 58, 0.2)',
          textDecoration: 'none'
        }}>
          Borrow Now <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Landing() {
  const { isAuth } = useAuth();


  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── Section 1: Hero ── */}
      <section className="hero-section" style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 'var(--hero-px-left, 80px)',
        paddingRight: 'var(--hero-px-right, 32px)',
        paddingTop: 120,
        paddingBottom: 80,
        position: 'relative',
        background: 'var(--bg)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 45%) minmax(0, 55%)',
          gap: 'clamp(40px, 5vw, 60px)',
          alignItems: 'center',
          width: '100%',
          maxWidth: 1600, // Maximum width to prevent extreme stretching on ultra-wide screens
          margin: '0' // Align to the left padding
        }}>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 99, background: 'rgba(107, 79, 58, 0.08)', border: '1px solid rgba(107, 79, 58, 0.1)', marginBottom: 32 }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 12px rgba(107, 79, 58, 0.3)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Verified Campus Marketplace</span>
            </motion.div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 32, letterSpacing: '-0.04em', color: 'var(--text)', maxWidth: 600 }}>
              Buy, Sell & Borrow <br />
              <span style={{ color: 'var(--primary)' }}>Within Your Campus.</span>
            </h1>

            <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 48, maxWidth: 520 }}>
              The exclusive marketplace for verified college students.
              Trade safely with your campus mates — books, tech, and more.
            </p>

            <div className="hero-btns" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 64 }}>
              <motion.div {...btnTap}>
                <Link to="/buy" className="btn-primary" style={{ padding: '18px 40px', fontSize: 16, borderRadius: 14, boxShadow: '0 8px 24px rgba(107, 79, 58, 0.15)' }}>
                  Browse Items
                </Link>
              </motion.div>
              <motion.div {...btnTap}>
                <Link to="/borrow" className="btn-outline" style={{ padding: '18px 40px', fontSize: 16, borderRadius: 14, background: 'transparent', border: '1px solid var(--border)' }}>
                  Explore Borrowing
                </Link>
              </motion.div>
            </div>

            <div style={{ display: 'flex', gap: 32, alignItems: 'center', opacity: 0.8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>
                <CheckCircle size={18} color="var(--success)" /> Verified Students
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>
                <CheckCircle size={18} color="var(--success)" /> Hand-to-Hand Exchange
              </div>
            </div>
          </motion.div>

          {/* Right Visual Section: Lottie Animation (Redesigned) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}
          >
            <div style={{ width: '100%', maxWidth: 750, position: 'relative' }}>
              <div className="hero-animation" style={{
                width: '120%',
                height: '120%',
                marginLeft: '-10%', // Center the 120% width relative to the container
                marginTop: '-10%'   // Center the 120% height relative to the container
              }}>
                <DotLottieReact
                  src="https://lottie.host/e38438bb-82c8-49c3-9bf1-cb4dd8ec5b90/i8VkWnpea5.lottie"
                  loop
                  autoplay
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .hero-section {
              padding: 100px 24px 60px !important;
            }
            .hero-section > div {
              grid-template-columns: 1fr !important;
              gap: 60px !important;
              text-align: center;
            }
            .hero-section h1, .hero-section p {
              margin-left: auto;
              margin-right: auto;
            }
            .hero-section div[style*="display: flex"] {
              justify-content: center !important;
            }
            .hero-btns {
              flex-direction: column !important;
              width: 100%;
            }
            .hero-btns > div, .hero-btns a {
              width: 100%;
              display: flex !important;
              justify-content: center;
            }
          }
        `}</style>
      </section>

      {/* ── Section 2: How It Works ── */}
      <section id="how-it-works" style={{ padding: '100px 0', background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 className="section-title">How CampusBazaar Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Simple, secure, and community-driven marketplace</p>
          </div>

          <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
            {[
              { title: 'List or Browse', icon: ShoppingBag, desc: 'Find great deals or list your unused items in seconds with our simple post flow.' },
              { title: 'Chat Directly', icon: ArrowRight, desc: 'Safe, in-platform messaging. Negotiate and decide on a meeting point within campus.' },
              { title: 'Exchange on Campus', icon: CheckCircle, desc: 'Meet up, verify the item, and complete the transaction safely on your own turf.' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <step.icon size={24} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Categories ── */}
      <section style={{ padding: '100px 0' }}>
        <div className="page-container">
          <div className="category-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60 }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Discover by Category</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Find exactly what you are looking for</p>
            </div>
            <Link to="/buy" className="btn-outline" style={{ border: 'none', color: 'var(--primary)', background: 'var(--primary-light)' }}>
              Browse All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {['Books', 'Electronics', 'Notes', 'Hostel Items', 'Cycles', 'Calculators', 'Furniture', 'Others'].map(cat => (
              <Link key={cat} to={`/buy?category=${cat.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -4, borderColor: 'var(--primary)' }}
                  style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 24px', textAlign: 'center', transition: 'all 0.2s' }}
                >
                  <h4 style={{ fontWeight: 700, color: 'var(--text)', fontSize: 16 }}>{cat}</h4>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Borrow (USP) ── */}
      <section style={{ padding: '100px 0', background: 'var(--primary-light)' }}>
        <div className="page-container">
          <div className="borrow-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 99, background: 'white', border: '1px solid #ddd6fe', marginBottom: 20 }}>
                <RefreshCw size={14} color="var(--primary)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>BORROW ECONOMY</span>
              </div>
              <h2 className="section-title">Rent Per Day, Save Big</h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>
                Need a calculator for one exam? Or a cycle for a week?
                Borrow from campus mates at affordable daily rates.
              </p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 16, marginBottom: 40 }}>
                {['Save Money', 'Eco-friendly sharing', 'Community trust'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600 }}>
                    <CheckCircle size={20} color="var(--primary)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/borrow" className="btn-primary" style={{ padding: '16px 36px' }}>Start Borrowing</Link>
            </div>

            <div style={{ flex: 1 }}>
              <StaggerList className="borrow-cards-grid" stagger={0.15} delayChildren={0.2} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 24,
                position: 'relative'
              }}>
                {BORROW_ITEMS.map((item) => (
                  <StaggerItem key={item.id}>
                    <BorrowProductCard item={item} />
                  </StaggerItem>
                ))}

                {/* Optional floating hint decoration */}
                <motion.div
                  variants={floatLoop}
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    opacity: 0.03,
                    zIndex: -1
                  }}
                />
              </StaggerList>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Founder's Message ── */}
      <section style={{ padding: '120px 0', background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 420px) minmax(0, 1fr)', gap: 80, alignItems: 'center' }} className="mobile-stack">
            {/* Left: Picture Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card"
              style={{ padding: 0, overflow: 'hidden', borderRadius: 32, border: '8px solid white', boxShadow: '0 24px 48px rgba(60, 47, 47, 0.12)' }}
            >
              <img
                src="/founder.jpg"
                alt="Founder Portrait"
                style={{ width: '100%', height: 500, objectFit: 'cover', display: 'block' }}
              />
            </motion.div>

            {/* Right: Message Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 99, background: 'var(--primary-light)', border: '1px solid rgba(107, 79, 58, 0.1)', marginBottom: 32 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>From The Founder</span>
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--text)', marginBottom: 32, fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
                Redefining How We <br />
                <span style={{ color: 'var(--primary)' }}>Trade On Campus.</span>
              </h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '1.125rem', lineHeight: 1.8, fontWeight: 500 }}>
                <p style={{ marginBottom: 24 }}>
                  "CampusBazaar was built on a simple premise: your campus is already a massive resource. Why look elsewhere for things that are sitting in a hostel room just two blocks away?"
                </p>
                <p style={{ marginBottom: 24 }}>
                  I wanted to create a platform that prioritizes student safety and local trust. Whether you're selling a lab coat or borrowing a scientific calculator for an exam, our goal is to make it as seamless as walking to your campus canteen.
                </p>
                <p style={{ marginBottom: 40 }}>
                  Thank you for being part of this community. We’re just getting started on making student life more affordable and connected.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 48, height: 2, background: 'var(--primary)' }} />
                  <div>
                    <h4 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', marginBottom: 2 }}>Apoorv Nigam</h4>
                    <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Building Your Marketplace</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .mobile-stack {
              grid-template-columns: 1fr !important;
              gap: 48px !important;
              text-align: center;
            }
            .mobile-stack div[style*="display: flex"] {
              justify-content: center !important;
            }
            .mobile-stack .card {
              max-width: 400px;
              margin: 0 auto;
            }
            .borrow-main-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
              text-align: center;
            }
            .borrow-main-grid ul {
              justify-content: center;
            }
          }
          @media (max-width: 768px) {
            .how-it-works-grid {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
              text-align: center;
            }
            .how-it-works-grid > div {
              text-align: center !important;
            }
            .how-it-works-grid > div > div {
              margin: 0 auto 24px auto !important;
            }
            .category-header {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 16px;
            }
            .category-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 16px !important;
            }
            .borrow-cards-grid {
              grid-template-columns: 1fr !important;
            }
            .borrow-cards-grid > div > div {
              grid-column: span 1 !important;
            }
            .stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 32px !important;
            }
            .footer-flex {
              flex-direction: column;
              gap: 32px;
              text-align: center;
            }
            .footer-links {
              flex-direction: column;
              gap: 20px !important;
            }
          }
        `}</style>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '60px 0', background: 'white' }}>
        <div className="page-container footer-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: 900, fontSize: 12, fontFamily: 'Outfit, sans-serif' }}>CB</span>
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--text)' }}>
                Campus<span style={{ color: 'var(--primary)' }}>Bazaar</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 14 }}>The exclusive marketplace for verified students.</p>
          </div>
          <div className="footer-links" style={{ display: 'flex', gap: 40, alignItems: 'center', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
            <Link to="/buy">Marketplace</Link>
            <Link to="/borrow">Borrowing</Link>
            <Link to="/about">About Us</Link>
            <Link to="/login" style={{ color: 'var(--primary)' }}>Get Started</Link>
          </div>
        </div>
        <div className="page-container" style={{ marginTop: 40, paddingTop: 40, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          © 2026 CampusBazaar. Built for students.
        </div>
      </footer>

    </div>
  );
}
