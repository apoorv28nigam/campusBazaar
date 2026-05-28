import { Link } from 'react-router-dom';
import { 
  ShoppingBag, ShieldCheck, Zap, Users, 
  ArrowRight, CheckCircle, RefreshCw, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';

// Animation configurations
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const btnTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

export default function About() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      
      {/* ── 1. Hero Section ── */}
      <section style={{
        paddingTop: 160,
        paddingBottom: 100,
        paddingLeft: 'max(32px, 5vw)',
        paddingRight: 'max(32px, 5vw)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--bg) 0%, rgba(139, 94, 60, 0.03) 100%)',
        position: 'relative'
      }}>
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          style={{ maxWidth: 800, margin: '0 auto' }}
        >
          <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 99, background: 'rgba(107, 79, 58, 0.08)', border: '1px solid rgba(107, 79, 58, 0.1)', marginBottom: 32 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Our Mission</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.04em', fontFamily: 'Outfit, sans-serif' }}>
            From WhatsApp Chaos <br/>
            to <span style={{ color: 'var(--primary)' }}>Campus Commerce.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 48, maxWidth: 640, margin: '0 auto 48px' }}>
            We're building the ultimate trusted platform for college students to buy, sell, and rent items seamlessly within their own campus ecosystem.
          </motion.p>
          
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div {...btnTap}>
              <Link to="/register" className="btn-primary" style={{ padding: '16px 36px', fontSize: 16, borderRadius: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                Join CampusBazaar <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div {...btnTap}>
              <Link to="/buy" className="btn-outline" style={{ padding: '16px 36px', fontSize: 16, borderRadius: 14, textDecoration: 'none', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
                Explore Listings
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. Story Section ── */}
      <section style={{ padding: '120px 0', background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 60 }}>
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: 32 }}>The Problem With <br/>Scattered Groups</h2>
              <div style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <p>
                  As college students, we've all been there. You need a scientific calculator for your midterms, or you're trying to get rid of last semester's heavy textbooks. What do you do? You spam five different WhatsApp groups, hoping someone replies before the message gets buried under 100 memes.
                </p>
                <p>
                  We realized that campuses are massive local economies full of unused resources, yet the infrastructure to trade them was primitive. No organized listings, no search functionality, no verification, and absolutely no privacy.
                </p>
                <div style={{ padding: '32px', background: 'var(--primary-light)', borderRadius: 24, border: '1px solid rgba(139, 94, 60, 0.1)', marginTop: 16 }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>The CampusBazaar Solution</h3>
                  <p style={{ color: 'var(--text-muted)' }}>
                    We built CampusBazaar to bring order to the chaos. It's a dedicated, verified platform exclusively for your campus. Whether you're selling a lab coat, renting a laptop, or just looking for cheap notes, it happens here safely and efficiently.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. Features / Values Grid ── */}
      <section style={{ padding: '120px 0', background: 'var(--bg)' }}>
        <div className="page-container" style={{ padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>Built For The Student Economy</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}>Everything you need to trade within your college.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {[
              { icon: ShoppingBag, title: 'Buy & Sell Easily', desc: 'List items in seconds. Find great deals on textbooks, electronics, and dorm essentials.' },
              { icon: RefreshCw, title: 'Rent Per Day', desc: 'Need something temporarily? Borrow gear, calculators, or bikes on a daily basis.' },
              { icon: ShieldCheck, title: 'Trusted Network', desc: 'No strangers. Everyone on the platform is a verified student from your campus.' },
              { icon: Smartphone, title: 'Modern Experience', desc: 'A sleek, intuitive app designed specifically for Gen-Z college students.' },
              { icon: Zap, title: 'Instant Discovery', desc: 'Stop scrolling through chat groups. Powerful search and categorical filtering.' },
              { icon: Users, title: 'Community Driven', desc: 'Hand-to-hand campus exchange means zero shipping fees and zero wait times.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ background: 'white', padding: 40, borderRadius: 24, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <feature.icon size={28} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Stats Section ── */}
      <section style={{ padding: '100px 0', background: 'var(--primary)', color: 'white' }}>
        <div className="page-container" style={{ padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, textAlign: 'center' }}>
            {[
              { label: 'Verified Students', value: '10,000+' },
              { label: 'Active Listings', value: '5,000+' },
              { label: 'Exchanges Made', value: '15,000+' },
              { label: 'College Campuses', value: '50+' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <h3 style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>{stat.value}</h3>
                <p style={{ fontSize: '1.125rem', fontWeight: 600, opacity: 0.8 }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Why CampusBazaar Section ── */}
      <section style={{ padding: '120px 0', background: 'white' }}>
        <div className="page-container" style={{ padding: '0 32px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>The Better Way To Trade</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            {/* WhatsApp Side */}
            <div style={{ background: '#fef2f2', padding: 40, borderRadius: 24, border: '1px solid #fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b' }}>Chat Groups</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, color: '#7f1d1d' }}>
                <li style={{ display: 'flex', gap: 12 }}><span style={{ opacity: 0.6 }}>✕</span> Disorganized messages</li>
                <li style={{ display: 'flex', gap: 12 }}><span style={{ opacity: 0.6 }}>✕</span> Hard to search for items</li>
                <li style={{ display: 'flex', gap: 12 }}><span style={{ opacity: 0.6 }}>✕</span> No verified student profiles</li>
                <li style={{ display: 'flex', gap: 12 }}><span style={{ opacity: 0.6 }}>✕</span> No dedicated rent/borrow features</li>
              </ul>
            </div>

            {/* CampusBazaar Side */}
            <div style={{ background: 'var(--primary-light)', padding: 40, borderRadius: 24, border: '1px solid rgba(139, 94, 60, 0.1)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(20px)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                <CheckCircle size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>CampusBazaar</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text)', position: 'relative', zIndex: 1, fontWeight: 500 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle size={16} color="var(--success)" /> Structured, searchable listings</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle size={16} color="var(--success)" /> Categorized discovery</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle size={16} color="var(--success)" /> Verified college email authentication</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle size={16} color="var(--success)" /> Built-in rental economy system</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Final CTA Section ── */}
      <section style={{ padding: '120px 0', background: 'var(--bg)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: 600, margin: '0 auto', padding: '0 32px' }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: 24 }}>Ready to clear out your dorm?</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: 40 }}>
            Join thousands of students trading smarter, not harder. Turn your old notes into cash or find your next semester's books for cheap.
          </p>
          <motion.div {...btnTap}>
            <Link to="/register" className="btn-primary" style={{ padding: '18px 48px', fontSize: 16, borderRadius: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Get Started Now <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer Reused from Landing ── */}
      <footer style={{ padding: '60px 0', background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px' }}>
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
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
            <Link to="/buy" style={{ textDecoration: 'none', color: 'inherit' }}>Marketplace</Link>
            <Link to="/borrow" style={{ textDecoration: 'none', color: 'inherit' }}>Borrowing</Link>
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Log In</Link>
          </div>
        </div>
        <div className="page-container" style={{ marginTop: 40, paddingTop: 40, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '0 32px' }}>
          © {new Date().getFullYear()} CampusBazaar. Built for students.
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          section > div > div {
            grid-template-columns: 1fr !important;
          }
          footer > div:first-child {
            flex-direction: column;
            gap: 32px;
            text-align: center;
          }
          footer > div:first-child > div:last-child {
            flex-direction: column;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
