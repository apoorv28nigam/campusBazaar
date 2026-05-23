import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, PlusCircle, RefreshCw, MessageCircle,
  Bell, User, Search, Menu, LogOut, ShoppingCart,
  ChevronDown, Megaphone, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { fadeDown, staggerContainer, fadeUp, ease, dur, btnTap } from './animations/motionConfig';

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [search, setSearch]           = useState('');
  const [menuOpen, setMenuOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [unread, setUnread]           = useState(0);
  const [scrolled, setScrolled]       = useState(false);
  const profileRef = useRef(null);

  /* ── Scroll listener ───────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Notifications ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (isAuth) {
      notificationsAPI.getAll().then(res => setUnread(res.data.unreadCount)).catch(() => {});
    }
  }, [isAuth, location.pathname]);

  /* ── Close profile on outside click ───────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/buy?search=${encodeURIComponent(search.trim())}`); setSearch(''); setDrawerOpen(false); }
  };

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); navigate('/'); };

  const navLinks = [
    { to: '/buy',      label: 'Buy',      icon: ShoppingBag },
    { to: '/sell',     label: 'Sell',     icon: PlusCircle  },
    { to: '/borrow',   label: 'Borrow',   icon: RefreshCw   },
    { to: '/requests', label: 'Requests', icon: Megaphone   },
  ];

  /* ── Navbar background transitions on scroll ───────────────────────── */
  const navStyle = {
    position:       'fixed',
    top:            0, left: 0, right: 0,
    zIndex:         1000,
    background:     scrolled ? 'rgba(247, 245, 242, 0.95)' : 'transparent',
    backdropFilter: 'blur(20px)',
    borderBottom:   `1px solid ${scrolled ? 'rgba(107, 79, 58, 0.1)' : 'transparent'}`,
    boxShadow:      scrolled ? '0 4px 20px rgba(60, 47, 47, 0.05)' : 'none',
    transition:     'height 0.3s ease, background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
  };

  /* ── Dropdown menu variants ────────────────────────────────────────── */
  const dropdownVariants = {
    hidden:  { opacity: 0, y: -8, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.2, ease: ease.out } },
    exit:    { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15 } },
  };

  return (
    <>
      {/* ── Navbar bar ── */}
      <motion.nav
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        style={navStyle}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: scrolled ? 'var(--header-height, 64px)' : 'var(--header-height, 80px)', 
          paddingLeft: 'var(--hero-px-left, 80px)',
          paddingRight: 'var(--hero-px-right, 40px)',
          maxWidth: 1500,
          margin: '0 auto',
          transition: 'height 0.3s ease',
          justifyContent: 'space-between'
        }}>

          {/* Logo */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, textDecoration: 'none' }}>
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(107, 79, 58, 0.2)' }}
              >
                <span style={{ color: 'white', fontWeight: 900, fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>CB</span>
              </motion.div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text)', letterSpacing: '-0.03em' }}>
                Campus<span style={{ color: 'var(--primary)' }}>Bazaar</span>
              </span>
            </Link>
          </motion.div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 360, margin: '0 24px', display: 'none' }} className="desktop-search">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search campus..."
                style={{ width: '100%', padding: '10px 14px 10px 40px', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(107, 79, 58, 0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </form>

          {/* Desktop nav links */}
          <motion.div
            variants={staggerContainer(0.06, 0.15)}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', gap: 12, alignItems: 'center' }}
            className="desktop-nav"
          >
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <motion.div key={to} variants={fadeUp} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link to={to} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    borderRadius: 10, fontWeight: 700, fontSize: 14,
                    color: active ? 'var(--primary)' : 'var(--text)',
                    background: active ? 'var(--primary-light)' : 'transparent',
                    transition: 'all 0.2s', textDecoration: 'none',
                  }}>
                    {label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            {isAuth ? (
              <>
                {/* Messages (Desktop Only) */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} className="desktop-nav">
                  <Link to="/messages" style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: 'var(--primary)', border: '1px solid var(--border)', transition: 'all 0.2s', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <MessageCircle size={22} />
                  </Link>
                </motion.div>

                {/* Notifications */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
                  <Link to="/notifications" style={{ position: 'relative', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: 'var(--primary)', border: '1px solid var(--border)', transition: 'all 0.2s', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <motion.span animate={unread > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}} transition={{ duration: 0.5, repeat: unread > 0 ? Infinity : 0, repeatDelay: 3 }}>
                      <Bell size={22} />
                    </motion.span>
                    {unread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                        style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: 'var(--warning)', color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(198, 124, 78, 0.4)', border: '2px solid white' }}
                      >
                        {unread > 9 ? '9+' : unread}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
                
                {/* Profile dropdown (Desktop) */}
                <div ref={profileRef} style={{ position: 'relative' }} className="desktop-nav">
                   <motion.button
                    onClick={() => setProfileOpen(p => !p)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 4px 4px', background: 'white', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', color: 'var(--text)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                  >
                    <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6B4F3A&color=fff`}
                      alt="avatar" style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</span>
                    <motion.span animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 6, minWidth: 190, zIndex: 100, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
                      >
                        {[
                          { to: '/profile',  icon: User,          label: 'My Profile' },
                          { to: '/messages', icon: MessageCircle, label: 'Messages'   },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, color: 'var(--text)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Icon size={16} color="var(--primary)" /> {label}
                          </Link>
                        ))}
                        <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                        <button onClick={() => { setProfileOpen(false); handleLogout(); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, color: 'var(--danger)', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.2s', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <LogOut size={16} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="desktop-nav" style={{ display: 'flex', gap: 12 }}>
                <motion.div {...btnTap}>
                  <Link to="/login" className="btn-outline" style={{ padding: '8px 20px', fontSize: 14, border: 'none', background: 'transparent' }}>Log In</Link>
                </motion.div>
                <motion.div {...btnTap}>
                  <Link to="/register" className="btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>Sign Up</Link>
                </motion.div>
              </div>
            )}
            
            {/* Hamburger Menu (Mobile Only) */}
            <button className="mobile-only-flex" onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '8px', alignItems: 'center' }}>
              <Menu size={28} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '80%', maxWidth: 320,
              background: 'white', zIndex: 2000, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
              display: 'flex', flexDirection: 'column', padding: '24px 20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
                Campus<span style={{ color: 'var(--primary)' }}>Bazaar</span>
              </span>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <X size={24} color="var(--text)" />
              </button>
            </div>
            
            {/* Search in Drawer */}
            <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search campus..."
                  style={{ width: '100%', padding: '12px 14px 12px 40px', background: '#f9fafb', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 16, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </form>

            {/* Drawer links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1 }}>
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, color: 'var(--text)', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s' }}>
                  <Icon size={20} color="var(--primary)" /> {label}
                </Link>
              ))}
              
              <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
              
              {isAuth ? (
                <>
                  <Link to="/profile" onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: 'var(--text)', textDecoration: 'none', fontWeight: 600, borderRadius: 12 }}>
                    <User size={20} color="var(--primary)" /> My Profile
                  </Link>
                  <button onClick={() => { setDrawerOpen(false); handleLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: 'var(--danger)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', borderRadius: 12 }}>
                    <LogOut size={20} /> Logout
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  <Link to="/login" onClick={() => setDrawerOpen(false)} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Log In</Link>
                  <Link to="/register" onClick={() => setDrawerOpen(false)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {drawerOpen && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)}
             style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1999 }} />
        )}
      </AnimatePresence>
    </>
  );
}
