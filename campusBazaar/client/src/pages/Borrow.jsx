import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, RefreshCw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { borrowAPI } from '../services/api';
import BorrowCard from '../components/BorrowCard';
import { SkeletonCard } from '../components/Loader';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StaggerList, StaggerItem } from '../components/animations/StaggerList';
import AnimatedSection from '../components/animations/AnimatedSection';
import { btnTap, iconHover, fadeUp, scaleIn, ease } from '../components/animations/motionConfig';

const CATEGORIES = ['all','books','electronics','clothing','furniture','sports','stationery','tools','other'];
const SORTS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'price_asc', label: 'Rent: Low to High' },
  { value: 'price_desc', label: 'Rent: High to Low' },
];

export default function Borrow() {
  const { isAuth } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');

  const fetchItems = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12 };
      if (category !== 'all') params.category = category;
      if (sort !== 'latest') params.sort = sort;

      const res = await borrowAPI.getAll(params);
      setItems(p === 1 ? res.data.items : prev => [...prev, ...res.data.items]);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(p);
    } catch (e) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(1); }, [category, sort]);

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container">
        {/* Header */}
        <AnimatedSection as="div" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'var(--primary-light)', border: '1px solid #ddd6fe', marginBottom: 12 }}
            >
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw size={13} color="var(--primary)" />
              </motion.span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.02em' }}>PEER-TO-PEER SHARING</span>
            </motion.div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>Borrow Resources</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{total} items available to borrow on campus</p>
          </div>
          {isAuth && (
            <motion.div {...btnTap}>
              <Link to="/borrow/create" className="btn-primary" style={{ padding: '0 24px', height: 48, fontSize: 14 }}>
                + List Item for Rent
              </Link>
            </motion.div>
          )}
        </AnimatedSection>

        {/* Sort & categories */}
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}
        >
          <div style={{ position: 'relative' }}>
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)} 
              style={{ 
                padding: '0 40px 0 16px', 
                height: 48,
                background: 'white', 
                border: '1px solid var(--border)', 
                borderRadius: 12, 
                color: 'var(--text)', 
                fontSize: 14, 
                cursor: 'pointer', 
                appearance: 'none', 
                fontFamily: 'Inter, sans-serif', 
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        </motion.div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATEGORIES.map(cat => (
            <motion.button 
              key={cat}
              onClick={() => setCategory(cat)} 
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '8px 18px', 
                borderRadius: 99, 
                border: `1px solid ${category === cat ? 'var(--primary)' : 'var(--border)'}`,
                background: category === cat ? 'var(--primary)' : 'white',
                color: category === cat ? 'white' : 'var(--text-muted)', 
                fontSize: 13, 
                fontWeight: 600, 
                cursor: 'pointer',
                textTransform: 'capitalize', 
                transition: 'all 0.2s', 
                fontFamily: 'Inter, sans-serif',
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                boxShadow: category === cat ? '0 4px 10px var(--primary-light)' : 'none'
              }}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {loading && page === 1 ? (
            <motion.div 
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="items-grid"
            >
              {Array(8).fill(null).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '100px 0' }}
            >
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <RefreshCw size={32} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Nothing to borrow yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Be the first to list an item for rent on your campus!</p>
              {isAuth && (
                <Link to="/borrow/create" className="btn-primary" style={{ padding: '0 32px' }}>List Your Item</Link>
              )}
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <StaggerList key={category} stagger={0.05} threshold={0.1} className="items-grid">
                {items.map(item => <BorrowCard key={item._id} item={item} />)}
              </StaggerList>
              {page < pages && (
                <div style={{ textAlign: 'center', marginTop: 56 }}>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fetchItems(page + 1)} 
                    className="btn-outline" 
                    disabled={loading} 
                    style={{ padding: '0 40px', height: 48, fontSize: 15, background: 'white' }}
                  >
                    {loading ? 'Processing...' : 'Load More Items'}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
