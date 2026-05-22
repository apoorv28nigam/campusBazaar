import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Eye, MapPin } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { scaleIn, ease } from './animations/motionConfig';

const CATEGORY_COLORS = {
  books: '#6B4F3A', electronics: '#8B5E3C', clothing: '#C67C4E',
  furniture: '#5E8C61', sports: '#91A88A', stationery: '#B08D74',
  food: '#D97706', other: '#827164', free: '#5E8C61',
};

/**
 * Animated ItemCard.
 *
 * Wrap groups of ItemCards with <StaggerList> for automatic stagger.
 * The card itself handles hover lift + glow on its own.
 */
export default function ItemCard({ item, onSave }) {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [saved,   setSaved]   = useState(user?.savedItems?.includes(item._id));
  const [saving,  setSaving]  = useState(false);
  const [imgHover, setImgHover] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');
    setSaving(true);
    try {
      const res = await usersAPI.saveItem(item._id);
      setSaved(res.data.saved);
      if (onSave) onSave(item._id, res.data.saved);
    } catch (_) {}
    setSaving(false);
  };

  const price = item.isFree ? 'FREE' : `₹${item.price?.toLocaleString('en-IN')}`;
  const catColor = CATEGORY_COLORS[item.category] || 'var(--primary)';

  return (
    /* Motion wrapper — pick up stagger variant from parent <StaggerList> */
    <motion.div
      variants={scaleIn}
      whileHover={{
        y: -8,
        transition: { duration: 0.2, ease: ease.out },
      }}
      style={{ height: '100%' }}
    >
      <Link to={`/buy/${item._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div className="card card-hover" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', border: '1px solid var(--border)' }}>

          {/* ── Image ── */}
          <div
            style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden', background: 'var(--bg)' }}
            onMouseEnter={() => setImgHover(true)}
            onMouseLeave={() => setImgHover(false)}
          >
            <motion.img
              src={item.images?.[0] || `https://placehold.co/400x300/6B4F3A/ffffff?text=${encodeURIComponent(item.title?.charAt(0) || '?')}`}
              alt={item.title}
              animate={{ scale: imgHover ? 1.1 : 1 }}
              transition={{ duration: 0.6, ease: ease.out }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Category badge */}
            <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 8, background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', color: catColor, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {item.category}
            </div>

            {/* Sold overlay */}
            {item.status !== 'available' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(60, 47, 47, 0.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 24, color: item.status === 'sold' ? '#AF4C4C' : 'var(--warning)', textTransform: 'uppercase', letterSpacing: 2 }}>
                  {item.status}
                </span>
              </div>
            )}

            {/* Save / Heart */}
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            >
              <motion.span
                animate={saved ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart size={18} fill={saved ? '#AF4C4C' : 'none'} color={saved ? '#AF4C4C' : 'var(--text-muted)'} />
              </motion.span>
            </motion.button>
          </div>

          <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif' }}>
              {item.title}
            </h3>

            {/* Price */}
            <div style={{ fontSize: item.isFree ? 20 : 22, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              {price}
            </div>

            {/* Condition + Tags */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
              {item.condition && (
                <span className="badge badge-primary" style={{ fontSize: 10, padding: '2px 8px' }}>
                  {item.condition}
                </span>
              )}
            </div>

            {/* Seller + Views */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src={item.seller?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.seller?.name || 'U')}&background=6B4F3A&color=fff&size=32`}
                  alt="seller" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                />
                <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 700, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.seller?.name?.split(' ')[0]}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                <Eye size={14} strokeWidth={2} /> {item.views || 0}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
