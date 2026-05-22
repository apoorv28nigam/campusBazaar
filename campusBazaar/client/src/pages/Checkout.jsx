import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, CreditCard, Info } from 'lucide-react';
import { itemsAPI, messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonDetail } from '../components/Loader';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    itemsAPI.getOne(id)
      .then(res => setItem(res.data))
      .catch(() => {
        toast.error('Item not found');
        navigate('/buy');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChat = async () => {
    setPayLoading(true);
    try {
      const res = await messagesAPI.getOrCreate({ recipientId: item.seller._id, itemId: item._id });
      navigate(`/messages/${res.data._id}`);
    } catch (e) {
      toast.error('Could not open chat');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return <SkeletonDetail />;
  if (!item) return null;

  const total = item.price;

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, marginBottom: 16, padding: 0, fontFamily: 'Outfit, sans-serif' }}>
            <ArrowLeft size={18} /> Back to item
          </button>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            Checkout
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>Review your order details below</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, alignItems: 'start' }}>
          {/* Left Column: Item Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Item Card */}
            <div className="card" style={{ padding: 32, display: 'flex', gap: 24, border: '1px solid var(--border)' }}>
              <div style={{ width: 140, height: 140, borderRadius: 16, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                <img src={item.images?.[0] || `https://placehold.co/400x300/6B4F3A/ffffff?text=${encodeURIComponent(item.title)}`} 
                  alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--primary-light)', padding: '4px 12px', borderRadius: 8 }}>{item.category}</span>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginTop: 12, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>{item.title}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
                      <img src={item.seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.seller.name)}&background=6B4F3A&color=fff&size=24`} 
                        alt="" style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)' }} />
                      Seller: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{item.seller.name}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery / Pickup Info */}
            <div className="card" style={{ padding: 32, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Outfit, sans-serif' }}>
                <Truck size={24} color="var(--primary)" /> Delivery & Pickup
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', marginTop: 8, boxShadow: '0 0 8px var(--primary-light)' }} />
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: 800, fontSize: 16 }}>On-Campus Physical Meetup</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4, lineHeight: 1.5, fontWeight: 500 }}>
                      Arrange a meeting with the seller at <strong style={{ color: 'var(--primary)' }}>{item.location || 'a secure campus area'}</strong> for item hand-over.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 20, borderRadius: 16, background: 'var(--primary-light)', border: '1px solid rgba(107, 79, 58, 0.1)' }}>
                  <ShieldCheck size={22} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <p style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                    This platform does not process payments. Connect with the seller directly to arrange a safe physical meetup.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="card" style={{ padding: 32, position: 'sticky', top: 120, border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 32, fontFamily: 'Outfit, sans-serif' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 16, fontWeight: 600 }}>
                <span>Item Subtotal</span>
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>₹{item.price.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)', fontSize: 22, fontWeight: 900 }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button onClick={handleChat} disabled={payLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 18, fontWeight: 800, marginBottom: 8, boxShadow: '0 8px 20px rgba(107, 79, 58, 0.2)' }}>
              {payLoading ? 'Loading...' : (
                <><ShoppingBag size={22} /> Message to Buy</>
              )}
            </button>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, fontWeight: 500, marginBottom: 20 }}>
              connect with seller by messaging them and buy meeting them in person
            </p>

            <div style={{ marginTop: 32, padding: 20, borderRadius: 16, background: 'var(--bg)', border: '1px dashed var(--border)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, fontWeight: 500 }}>
                By checking out, you agree to our <Link to="#" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Terms</Link> and <Link to="#" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Buyer Policies</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
