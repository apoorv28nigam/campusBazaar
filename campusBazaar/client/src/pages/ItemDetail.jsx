import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, ShoppingBag, Star, Eye, MapPin, Calendar, Share2, Heart, CheckCircle, AlertTriangle } from 'lucide-react';
import { itemsAPI, messagesAPI, paymentsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonDetail } from '../components/Loader';
import toast from 'react-hot-toast';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    itemsAPI.getOne(id)
      .then(res => {
        setItem(res.data);
        setSaved(user?.savedItems?.includes(res.data._id));
      })
      .catch(() => toast.error('Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = async () => {
    if (!user) return navigate('/login');
    setChatLoading(true);
    try {
      const res = await messagesAPI.getOrCreate({ recipientId: item.seller._id, itemId: item._id });
      navigate(`/messages/${res.data._id}`);
    } catch (e) {
      toast.error('Could not open chat');
    } finally {
      setChatLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!user) return navigate('/login');
    if (item.isFree) return toast.success('This item is FREE! Chat with the seller to collect.');
    navigate(`/checkout/${item._id}`);
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await usersAPI.saveItem(item._id);
      setSaved(res.data.saved);
      toast.success(res.data.saved ? 'Item saved!' : 'Removed from saved');
    } catch (e) {}
  };

  if (loading) return <SkeletonDetail />;
  if (!item) return <div style={{ textAlign: 'center', padding: 80 }}><h2>Item not found</h2></div>;

  const isSeller = user && item.seller._id === user._id;
  const images = item.images?.length ? item.images : [`https://placehold.co/600x400/1a1a2e/6366f1?text=${encodeURIComponent(item.title)}`];

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container">
        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, marginBottom: 32, fontFamily: 'Outfit, sans-serif', padding: 0 }}>
          <ArrowLeft size={18} /> Back to listings
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, alignItems: 'start' }}>
          {/* Left */}
          <div>
            {/* Main image */}
            <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 16, background: 'white', aspectRatio: '4/3', position: 'relative', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
              <img src={images[currentImg]} alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {item.status !== 'available' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ background: item.status === 'sold' ? '#A65D57' : '#C67C4E', color: 'white', padding: '12px 32px', borderRadius: 12, fontWeight: 900, fontSize: 24, textTransform: 'uppercase', letterSpacing: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                    {item.status}
                  </span>
                </div>
              )}
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImg(p => (p - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'white', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>‹</button>
                  <button onClick={() => setCurrentImg(p => (p + 1) % images.length)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'white', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>›</button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImg(i)} style={{ width: 80, height: 80, borderRadius: 14, overflow: 'hidden', border: `3px solid ${currentImg === i ? 'var(--primary)' : 'var(--border)'}`, padding: 0, cursor: 'pointer', background: 'white', transition: 'all 0.2s', boxShadow: currentImg === i ? '0 4px 12px rgba(107, 79, 58, 0.2)' : 'none' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="card" style={{ marginTop: 32, padding: 32, border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>Description</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 16, fontWeight: 500, whiteSpace: 'pre-wrap' }}>{item.description}</p>
              {item.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                  {item.tags.map(tag => <span key={tag} className="tag" style={{ background: 'var(--bg)', color: 'var(--primary)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 10, fontWeight: 700, fontSize: 13 }}>#{tag}</span>)}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Item info */}
            <div className="card" style={{ padding: 32, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <span style={{ padding: '6px 14px', borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.category}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSave} style={{ background: 'white', border: '1px solid var(--border)', cursor: 'pointer', padding: 10, borderRadius: 12, transition: 'all 0.2s' }}>
                    <Heart size={20} fill={saved ? '#ef4444' : 'none'} color={saved ? '#ef4444' : 'var(--text-muted)'} />
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} style={{ background: 'white', border: '1px solid var(--border)', cursor: 'pointer', padding: 10, borderRadius: 12 }}>
                    <Share2 size={20} color="var(--text-muted)" />
                  </button>
                </div>
              </div>

              <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 12, fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>{item.title}</h1>

              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'Outfit, sans-serif', marginBottom: 24, color: 'var(--primary)' }}>
                {item.isFree ? 'FREE' : `₹${item.price?.toLocaleString('en-IN')}`}
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, padding: '16px', borderRadius: 16, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)', fontWeight: 700 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.status === 'available' ? 'var(--success)' : '#ef4444', display: 'inline-block', boxShadow: `0 0 8px ${item.status === 'available' ? 'var(--success)' : '#ef4444'}` }} />
                  <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 700 }}>
                  Condition: <span style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{item.condition}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 32, fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={16} /> {item.views} views</span>
                {item.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {item.location}</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>

              {isSeller ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Link to={`/sell/${item._id}/edit`} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, background: 'white', border: '1px solid var(--border)', fontWeight: 800 }}>
                    Edit Listing
                  </Link>
                  <div style={{ padding: '12px', borderRadius: 12, background: 'var(--bg)', border: '1px dashed var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    You are the seller of this item
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {item.status === 'available' && (
                    <button onClick={handleBuy} className="btn-primary" disabled={payLoading} style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 18, fontWeight: 800, boxShadow: '0 8px 24px rgba(107, 79, 58, 0.2)' }}>
                      {payLoading ? 'Redirecting...' : (
                        <><ShoppingBag size={22} /> <span>{item.isFree ? 'Get for Free' : 'Buy Now'}</span></>
                      )}
                    </button>
                  )}
                  <button onClick={handleChat} className="btn-secondary" disabled={chatLoading} style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 17, fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}>
                    {chatLoading ? 'Opening...' : (
                      <><MessageCircle size={22} /> <span>Message Seller</span></>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Seller card */}
            <div className="card" style={{ padding: 24, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>About the Seller</h3>
              <Link to={`/profile/${item.seller._id}`} style={{ display: 'flex', gap: 16, alignItems: 'center', textDecoration: 'none' }}>
                <img src={item.seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.seller.name)}&background=6b4f3a&color=fff&size=56`}
                  alt="seller" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '2px solid var(--border)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{item.seller.name}</span>
                    {item.seller.isVerified && <CheckCircle size={16} color="#15803d" />}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{item.seller.college}</div>
                  {item.seller.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 800 }}>{Number(item.seller.rating).toFixed(1)}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>({item.seller.reviewsCount} reviews)</span>
                    </div>
                  )}
                </div>
              </Link>
              {item.seller.bio && <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6, fontWeight: 500 }}>{item.seller.bio}</p>}
            </div>

            {/* Safety tip */}
            <div style={{ padding: 20, borderRadius: 20, background: 'rgba(107, 79, 58, 0.05)', border: '1px solid rgba(107, 79, 58, 0.1)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>
                <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>Safety Tip:</strong> Always meet in campus public areas. Use our secure payment system. Never pay outside the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
