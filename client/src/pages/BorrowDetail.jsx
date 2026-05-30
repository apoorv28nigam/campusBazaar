import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Calendar, Shield, Star, CheckCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { borrowAPI, messagesAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonDetail } from '../components/Loader';
import toast from 'react-hot-toast';

export default function BorrowDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ fromDate: '', toDate: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    borrowAPI.getOne(id)
      .then(res => setItem(res.data))
      .catch(() => toast.error('Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = async () => {
    if (!user) return navigate('/login');
    setChatLoading(true);
    try {
      const res = await messagesAPI.getOrCreate({ recipientId: item.owner._id, borrowId: item._id });
      navigate(`/messages/${res.data._id}`);
    } catch (e) { toast.error('Could not open chat'); }
    finally { setChatLoading(false); }
  };

  const handleBorrowRequest = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!requestForm.fromDate || !requestForm.toDate) return toast.error('Please select dates');
    setSubmitting(true);
    try {
      await borrowAPI.request(item._id, requestForm);
      toast.success('Borrow request sent! The owner will get back to you.');
      setShowRequest(false);
      setRequestForm({ fromDate: '', toDate: '', message: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Request failed'); }
    finally { setSubmitting(false); }
  };

  const calcDays = () => {
    if (!requestForm.fromDate || !requestForm.toDate) return 0;
    return Math.max(1, Math.ceil((new Date(requestForm.toDate) - new Date(requestForm.fromDate)) / (1000 * 60 * 60 * 24)));
  };

  const isOwner = user && item?.owner?._id === user._id;
  if (loading) return <SkeletonDetail />;
  if (!item) return <div style={{ textAlign: 'center', padding: 80 }}><h2>Item not found</h2></div>;

  const images = item.images?.length ? item.images : [`https://placehold.co/600x400/1a1a2e/f59e0b?text=${encodeURIComponent(item.title)}`];
  const days = calcDays();

  return (
    <div className="std-page">
      <div className="page-container">
        <button onClick={() => navigate(-1)} className="std-back-btn" style={{ marginBottom: 32 }}>
          <ArrowLeft size={18} /> Back to Borrow
        </button>

        <div className="borrow-detail-grid">
          {/* Left */}
          <div>
            <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 16, background: 'white', aspectRatio: '4/3', position: 'relative', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
              <img src={images[currentImg]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: item.imageFit || 'contain' }} />
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImg(p => (p - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'white', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>‹</button>
                  <button onClick={() => setCurrentImg(p => (p + 1) % images.length)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'white', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>›</button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImg(i)} style={{ width: 80, height: 80, borderRadius: 14, overflow: 'hidden', border: `3px solid ${currentImg === i ? 'var(--primary)' : 'var(--border)'}`, padding: 0, cursor: 'pointer', background: 'white', transition: 'all 0.2s', boxShadow: currentImg === i ? '0 4px 12px rgba(107, 79, 58, 0.2)' : 'none' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            <div className="card borrow-detail-desc-card">
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>About this item</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 16, fontWeight: 500 }}>{item.description}</p>
            </div>

            {/* Borrow requests (owner view) */}
            {isOwner && item.borrowRequests?.length > 0 && (
              <div className="card borrow-detail-desc-card">
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>Borrow Requests</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {item.borrowRequests.map(req => (
                    <div key={req._id} style={{ padding: 20, borderRadius: 16, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <img src={req.borrower?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.borrower?.name || 'U')}&background=6B4F3A&color=fff&size=40`} alt="" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }} />
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>{req.borrower?.name}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <Clock size={12} /> {new Date(req.fromDate).toLocaleDateString()} — {new Date(req.toDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <span style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', ...(req.status === 'pending' ? { background: '#FFFBF0', border: '1px solid #FFE4A0', color: '#B45309' } : req.status === 'accepted' ? { background: '#F0FDF4', border: '1px solid #DCFCE7', color: '#15803D' } : { background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#B91C1C' }) }}>
                          {req.status}
                        </span>
                      </div>
                      {req.message && <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12, paddingLeft: 54, lineHeight: 1.5, fontWeight: 500 }}>{req.message}</p>}
                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingLeft: 54 }}>
                          <button onClick={async () => { await borrowAPI.respond(item._id, req._id, 'accepted'); toast.success('Request accepted!'); navigate(0); }} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700 }}>Accept</button>
                          <button onClick={async () => { await borrowAPI.respond(item._id, req._id, 'rejected'); toast.success('Request rejected'); navigate(0); }} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}>Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="borrow-detail-sidebar">
            <div className="card borrow-info-card">
              <div style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(198, 124, 78, 0.1)', border: '1px solid rgba(198, 124, 78, 0.2)', color: 'var(--primary)', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, textTransform: 'uppercase' }}>
                <RefreshCw size={14} /> For Rent
              </div>
              <h1 className="borrow-detail-title">{item.title}</h1>

              <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'baseline' }}>
                <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--primary)' }}>₹{item.rentPerDay}<span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-muted)' }}>/day</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: 'var(--text-muted)', fontWeight: 600 }}>
                  <Shield size={16} /> ₹{item.securityDeposit} deposit
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, padding: 20, borderRadius: 16, background: 'var(--bg)', border: '1px solid var(--border)', marginBottom: 24, flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-muted)', fontWeight: 700 }}>
                  <Calendar size={18} color="var(--primary)" />
                  <span>Available from: <span style={{ color: 'var(--text)' }}>{new Date(item.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 700, paddingLeft: 28 }}>
                  Until: <span style={{ color: 'var(--text)' }}>{new Date(item.availableTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, fontSize: 13, marginBottom: 32 }}>
                <span style={{ padding: '6px 14px', borderRadius: 10, background: 'white', border: '1px solid var(--border)', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 700 }}>
                  {item.condition}
                </span>
                <span style={{ padding: '6px 14px', borderRadius: 10, ...(item.status === 'available' ? { background: '#F0FDF4', border: '1px solid #DCFCE7', color: '#15803D' } : { background: '#FFFBF0', border: '1px solid #FFE4A0', color: '#B45309' }), textTransform: 'capitalize', fontWeight: 800 }}>
                  {item.status}
                </span>
              </div>

              {isOwner ? (
                <div style={{ display: 'flex', gap: 12 }}>
                  {item.status === 'borrowed' && (
                    <button onClick={async () => { await borrowAPI.markReturned(item._id); toast.success('Marked as returned!'); navigate(0); }} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '16px', fontSize: 15, fontWeight: 800 }}>Mark Returned</button>
                  )}
                  <Link to={`/borrow/${item._id}/edit`} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '16px', fontSize: 15, display: 'flex', alignItems: 'center', fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}>Edit Details</Link>
                </div>
              ) : item.status === 'available' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <button onClick={() => setShowRequest(p => !p)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 18, fontWeight: 800, boxShadow: '0 8px 24px rgba(107, 79, 58, 0.2)' }}>
                    <Calendar size={22} /><span>Request to Borrow</span>
                  </button>
                  <button onClick={handleChat} className="btn-secondary" disabled={chatLoading} style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 17, fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}>
                    <MessageCircle size={22} /><span>Chat with Owner</span>
                  </button>
                </div>
              ) : (
                <div style={{ padding: 18, borderRadius: 16, background: '#FFFBF0', border: '1px solid #FFE4A0', textAlign: 'center', color: '#B45309', fontWeight: 800, fontSize: 16 }}>
                  Currently Borrowed
                </div>
              )}

              {/* Borrow request form */}
              {showRequest && !isOwner && (
                <form onSubmit={handleBorrowRequest} className="animate-slide-down" style={{ marginTop: 20, padding: 24, borderRadius: 20, background: 'var(--bg)', border: '1px solid var(--primary-light)', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--text)', fontSize: 18, fontFamily: 'Outfit, sans-serif' }}>Borrow Request</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>FROM DATE</label>
                      <input className="input" type="date" value={requestForm.fromDate} onChange={e => setRequestForm(p => ({ ...p, fromDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} style={{ fontSize: 14, padding: '12px', background: 'white' }} required />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TO DATE</label>
                      <input className="input" type="date" value={requestForm.toDate} onChange={e => setRequestForm(p => ({ ...p, toDate: e.target.value }))} min={requestForm.fromDate || new Date().toISOString().split('T')[0]} style={{ fontSize: 14, padding: '12px', background: 'white' }} required />
                    </div>
                  </div>
                  {days > 0 && (
                    <div style={{ padding: '14px', borderRadius: 12, background: 'var(--primary-light)', border: '1px solid rgba(107, 79, 58, 0.1)', fontSize: 14, color: 'var(--primary)', fontWeight: 800 }}>
                      Total Estimation: ₹{(item.rentPerDay * days + item.securityDeposit).toLocaleString('en-IN')}
                      <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, opacity: 0.8 }}>({days} days × ₹{item.rentPerDay} + ₹{item.securityDeposit} deposit)</div>
                    </div>
                  )}
                  <textarea className="input" placeholder="Message to owner (optional)" value={requestForm.message} onChange={e => setRequestForm(p => ({ ...p, message: e.target.value }))} style={{ minHeight: 90, resize: 'none', fontSize: 14, background: 'white' }} />
                  <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, fontWeight: 800 }}>
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </form>
              )}
            </div>

            {/* Owner card */}
            <div className="card" style={{ padding: 24, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>About the Owner</h3>
              <Link to={`/profile/${item.owner._id}`} style={{ display: 'flex', gap: 16, alignItems: 'center', textDecoration: 'none' }}>
                <img src={item.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.owner.name)}&background=6B4F3A&color=fff&size=56`} alt="owner" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '2px solid var(--border)' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{item.owner.name}</span>
                    {item.owner.isVerified && <CheckCircle size={16} color="var(--success)" />}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{item.owner.college}</div>
                  {item.owner.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 800 }}>{Number(item.owner.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Link>
            </div>

            <div style={{ padding: 20, borderRadius: 20, background: 'rgba(107, 79, 58, 0.05)', border: '1px solid rgba(107, 79, 58, 0.1)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>
                <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>Note:</strong> Security deposit is refundable upon safe return. Always inspect the item before borrowing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
