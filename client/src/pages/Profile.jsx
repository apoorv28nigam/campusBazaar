import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, ShoppingBag, RefreshCw, Calendar, MapPin, MessageCircle } from 'lucide-react';
import { usersAPI, messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import BorrowCard from '../components/BorrowCard';
import { SkeletonProfile, SkeletonCard } from '../components/Loader';
import { formatDistanceToNow } from 'date-fns';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sell');

  useEffect(() => {
    usersAPI.getProfile(id)
      .then(res => setData(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = async () => {
    if (!user) return navigate('/login');
    const res = await messagesAPI.getOrCreate({ recipientId: id });
    navigate(`/messages/${res.data._id}`);
  };

  if (loading) return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 1000 }}>
        <SkeletonProfile />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          {Array(3).fill(null).map((_, i) => (
            <div key={i} className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, margin: '0 auto 16px' }} />
              <div className="skeleton" style={{ height: 32, width: '60px', margin: '0 auto 12px' }} />
              <div className="skeleton" style={{ height: 16, width: '100px', margin: '0 auto' }} />
            </div>
          ))}
        </div>
        <div className="items-grid">
          {Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );
  if (!data) return null;

  const { user: profile, listings, borrowListings, reviews } = data;
  const isOwn = user && user._id === id;

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 1000 }}>
        {/* Profile header */}
        <div className="card" style={{ padding: 40, marginBottom: 32, display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap', border: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <img src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6B4F3A&color=fff&size=100`}
              alt={profile.name} style={{ width: 100, height: 100, borderRadius: 16, objectFit: 'cover', border: '4px solid var(--primary-light)', boxShadow: '0 8px 16px rgba(107, 79, 58, 0.1)' }} />
            {profile.isVerified && (
              <div style={{ position: 'absolute', bottom: -8, right: -8, width: 32, height: 32, borderRadius: '50%', background: 'var(--success)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <CheckCircle size={18} color="white" />
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{profile.name}</h1>
              {profile.isVerified && <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}><CheckCircle size={14} /> Verified Student</span>}
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {profile.college}</span>
              {profile.course && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShoppingBag size={16} /> {profile.course}</span>}
              {profile.year && <span style={{ background: 'var(--bg)', padding: '2px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>{profile.year}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}</span>
            </div>

            {profile.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array(5).fill(null).map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(profile.rating) ? '#fbbf24' : 'none'} color={i < Math.round(profile.rating) ? '#fbbf24' : 'var(--border)'} />
                  ))}
                </div>
                <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 18, marginLeft: 4 }}>{Number(profile.rating).toFixed(1)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>({profile.reviewsCount} reviews)</span>
              </div>
            )}

            {profile.bio && <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, maxWidth: 600 }}>{profile.bio}</p>}
          </div>

          {!isOwn && user && (
            <button onClick={handleChat} className="btn-primary" style={{ padding: '14px 28px', fontSize: 15, flexShrink: 0, height: 52 }}>
              <MessageCircle size={18} /> Message Seller
            </button>
          )}
          {isOwn && (
            <Link to="/profile" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, height: 52, background: 'white', border: '1px solid var(--border)' }}>Edit Profile</Link>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[
            { label: 'Items Listed', value: listings.length, icon: ShoppingBag, color: 'var(--primary)' },
            { label: 'Lending Items', value: borrowListings.length, icon: RefreshCw, color: '#5E8C61' },
            { label: 'Total Reviews', value: reviews.length, icon: Star, color: '#C67C4E' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card" style={{ padding: 24, textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icon size={20} color={color} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{value}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {[{ key: 'sell', label: 'Listings', icon: ShoppingBag }, { key: 'borrow', label: 'Lending', icon: RefreshCw }, { key: 'reviews', label: 'Reviews', icon: Star }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700,
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `3px solid ${activeTab === tab.key ? 'var(--primary)' : 'transparent'}`,
              transition: 'all 0.2s', marginBottom: -1,
            }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'sell' && (
          listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 24, border: '1px dashed var(--border)' }}>
              <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>No active listings yet</p>
            </div>
          ) : (
            <div className="items-grid">{listings.map(item => <ItemCard key={item._id} item={item} />)}</div>
          )
        )}

        {activeTab === 'borrow' && (
          borrowListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 24, border: '1px dashed var(--border)' }}>
              <RefreshCw size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>No items for rent yet</p>
            </div>
          ) : (
            <div className="items-grid">{borrowListings.map(item => <BorrowCard key={item._id} item={item} />)}</div>
          )
        )}

        {activeTab === 'reviews' && (
          reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 24, border: '1px dashed var(--border)' }}>
              <Star size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>No reviews yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(review => (
                <div key={review._id} className="card" style={{ padding: 24, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <img src={review.reviewer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.name || 'U')}&background=6B4F3A&color=fff&size=44`} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{review.reviewer?.name}</div>
                        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                          {Array(5).fill(null).map((_, i) => <Star key={i} size={14} fill={i < review.rating ? '#fbbf24' : 'none'} color={i < review.rating ? '#fbbf24' : 'var(--border)'} />)}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                  </div>
                  {review.comment && <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, fontWeight: 500 }}>{review.comment}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
