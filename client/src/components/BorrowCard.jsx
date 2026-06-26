import { Link } from 'react-router-dom';
import { Calendar, Star, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { scaleIn, ease } from './animations/motionConfig';

export default function BorrowCard({ item }) {
  const [imgHover, setImgHover] = useState(false);
  const availFrom = new Date(item.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const availTo = new Date(item.availableTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{
        y: -6,
        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
        transition: { duration: 0.2, ease: ease.out },
      }}
      style={{ height: '100%' }}
    >
      <Link to={`/borrow/${item._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div className="card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
          {/* Image */}
          <div 
            style={{ position: 'relative', paddingTop: '70%', overflow: 'hidden', background: '#f9fafb' }}
            onMouseEnter={() => setImgHover(true)}
            onMouseLeave={() => setImgHover(false)}
          >
            <motion.img
              src={item.images?.[0] || `https://placehold.co/400x300/f3f4e1/6B4F3A?text=${encodeURIComponent(item.title?.charAt(0) || '?')}`}
              alt={item.title}
              animate={{ scale: imgHover ? 1.07 : 1 }}
              transition={{ duration: 0.45, ease: ease.out }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: item.imageFit || 'contain' }}
            />
            <div style={{
              position: 'absolute', top: 10, left: 10,
              padding: '2px 8px', borderRadius: 6,
              background: 'white', border: '1px solid var(--border)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: 'var(--primary)', fontSize: 10, fontWeight: 700, textTransform: 'capitalize',
            }}>
              {item.category}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif' }}>
              {item.title}
            </h3>

            {/* Availability info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>
              <Clock size={12} /> <span>Available: {availFrom} — {availTo}</span>
            </div>

            {/* Pricing */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'var(--primary)' }}>
                ₹{item.rentPerDay}/day
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <Shield size={11} /> ₹{item.securityDeposit}
              </div>
            </div>

            {/* Owner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={item.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.owner?.name || 'U')}&background=6B4F3A&color=fff&size=32`}
                  alt="owner" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{item.owner?.name?.split(' ')[0]}</span>
              </div>
              {item.owner?.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--warning)', fontWeight: 600 }}>
                  <Star size={12} fill="var(--warning)" /> {Number(item.owner.rating).toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
