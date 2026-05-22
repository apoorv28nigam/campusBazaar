import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, ChevronDown, SlidersHorizontal, Gift, TrendingUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import { SkeletonCard } from '../components/Loader';
import { StaggerList, StaggerItem } from '../components/animations/StaggerList';
import AnimatedSection from '../components/animations/AnimatedSection';
import { btnTap, iconHover, fadeUp, scaleIn, ease } from '../components/animations/motionConfig';

const CATEGORIES = ['all','books','electronics','clothing','furniture','sports','stationery','food','other','free'];
const SORTS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Viewed' },
];

export default function Buy() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState('latest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (sort !== 'latest') params.sort = sort;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await itemsAPI.getAll(params);
      setItems(p === 1 ? res.data.items : prev => [...prev, ...res.data.items]);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, minPrice, maxPrice]);

  useEffect(() => { fetchItems(1); }, [category, sort]);

  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    if (s) setSearch(s);
    if (c) setCategory(c);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(1);
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container">
        {/* Header */}
        <AnimatedSection as="div" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
            Explore Marketplace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{total} items available on your campus</p>
        </AnimatedSection>

        {/* Search + Filters */}
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}
        >
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 280, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search items, books, electronics..."
              style={{ 
                paddingLeft: 46, 
                paddingRight: search ? 46 : 16,
                background: 'white',
                border: '1px solid var(--border)',
                height: 48,
                borderRadius: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }} 
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); fetchItems(1); }} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={16} />
              </button>
            )}
          </form>

          {/* Sort */}
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

          <motion.button 
            onClick={() => setShowFilters(p => !p)} 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px',
              height: 48,
              background: showFilters ? 'var(--primary-light)' : 'white',
              border: `1px solid ${showFilters ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 12, color: showFilters ? 'var(--primary)' : 'var(--text)', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <SlidersHorizontal size={16} /> <span className="desktop-nav">Filters</span>
          </motion.button>
        </motion.div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              padding: 24, 
              background: 'white', 
              borderRadius: 16, 
              border: '1px solid var(--border)',
              marginBottom: 24, 
              display: 'flex', 
              gap: 20, 
              flexWrap: 'wrap', 
              alignItems: 'flex-end',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 8, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Min Price (₹)</label>
              <input className="input" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" style={{ background: '#f9fafb' }} />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 8, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Max Price (₹)</label>
              <input className="input" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any" style={{ background: '#f9fafb' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => fetchItems(1)} className="btn-primary" style={{ padding: '0 24px', height: 44, fontSize: 14 }}>Apply</button>
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); fetchItems(1); }} className="btn-outline" style={{ padding: '0 24px', height: 44, fontSize: 14 }}>Reset</button>
            </div>
          </motion.div>
        )}

        {/* Categories */}
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
              {cat === 'free' && <Gift size={12} />}
              {cat === 'all' ? 'All Items' : cat}
            </motion.button>
          ))}
        </div>

        {/* Items grid */}
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
                <Search size={32} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>No items found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Try adjusting your search or filters</p>
              <button 
                onClick={() => { setSearch(''); setCategory('all'); setMinPrice(''); setMaxPrice(''); }} 
                className="btn-primary"
                style={{ padding: '0 32px' }}
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <StaggerList key={category + search} stagger={0.05} threshold={0.1} className="items-grid">
                {items.map(item => <ItemCard key={item._id} item={item} />)}
              </StaggerList>

              {/* Load more */}
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
                    {loading ? 'Processing...' : `Load ${total - items.length} More Items`}
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
