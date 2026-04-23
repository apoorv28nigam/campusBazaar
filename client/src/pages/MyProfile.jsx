import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Save, ShoppingBag, RefreshCw, Package, CreditCard, Star, Trash2, Edit, CheckCircle } from 'lucide-react';
import { usersAPI, itemsAPI, borrowAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import BorrowCard from '../components/BorrowCard';
import { SkeletonCard, SkeletonProfile } from '../components/Loader';
import ImageCropper from '../components/ImageCropper';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence } from 'framer-motion';

const COLLEGES = ['GL Bajaj Institute of Technology and Management, Greater Noida'];

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [form, setForm] = useState({ name: user?.name || '', college: user?.college || '', course: user?.course || '', year: user?.year || '', bio: user?.bio || '', phone: user?.phone || '' });
  const [listings, setListings] = useState([]);
  const [borrowListings, setBorrowListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setLoadingData(true);
    usersAPI.getMyListings()
      .then(res => { setListings(res.data.items); setBorrowListings(res.data.borrowItems); })
      .finally(() => setLoadingData(false));

    paymentsAPI.history().then(res => setTransactions(res.data)).catch(() => {});
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (e) { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setSelectedImage(reader.result);
      setShowCropper(true);
    });
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (blob, previewUrl) => {
    setShowCropper(false);
    setAvatarPreview(previewUrl);
    
    const data = new FormData();
    data.append('avatar', blob, 'avatar.jpg');
    
    const loadingToast = toast.loading('Uploading avatar...');
    try {
      const res = await usersAPI.uploadAvatar(data);
      updateUser(res.data.user);
      toast.success('Profile picture updated!', { id: loadingToast });
    } catch (e) {
      toast.error('Failed to upload avatar', { id: loadingToast });
      setAvatarPreview(user?.avatar || '');
    } finally {
      setSelectedImage(null);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await itemsAPI.delete(id);
      setListings(p => p.filter(i => i._id !== id));
      toast.success('Listing deleted');
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleMarkSold = async (id) => {
    try {
      await itemsAPI.markSold(id);
      setListings(p => p.map(i => i._id === id ? { ...i, status: 'sold' } : i));
      toast.success('Marked as sold!');
    } catch (e) { toast.error('Failed'); }
  };

  const handleMarkAvailable = async (id) => {
    try {
      await itemsAPI.markAvailable(id);
      setListings(p => p.map(i => i._id === id ? { ...i, status: 'available' } : i));
      toast.success('Listing is now available!');
    } catch (e) { toast.error('Failed'); }
  };

  const TABS = [
    { key: 'listings', label: 'My Listings', icon: ShoppingBag },
    { key: 'borrow', label: 'Lending', icon: RefreshCw },
    { key: 'orders', label: 'Transactions', icon: CreditCard },
    { key: 'settings', label: 'Edit Profile', icon: Edit },
  ];

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 1000 }}>
        <div className="card" style={{ padding: 40, marginBottom: 32, display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap', border: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
            <img src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6B4F3A&color=fff&size=100`}
              alt={user?.name} style={{ width: 100, height: 100, borderRadius: 16, objectFit: 'cover', border: '4px solid var(--primary-light)', boxShadow: '0 8px 16px rgba(107, 79, 58, 0.1)' }} />
            <div style={{ position: 'absolute', bottom: -8, right: -8, width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <Camera size={16} />
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
          </div>
          
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{user?.name}</h1>
              {user?.isVerified && <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}><CheckCircle size={14} /> Verified Member</span>}
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Package size={16} /> {user?.college}
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text)', background: 'var(--bg)', padding: '6px 14px', borderRadius: 10, fontWeight: 700, border: '1px solid var(--border)' }}>{user?.course}</span>
              <span style={{ fontSize: 13, color: 'var(--text)', background: 'var(--bg)', padding: '6px 14px', borderRadius: 10, fontWeight: 700, border: '1px solid var(--border)' }}>{user?.year}</span>
              {user?.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFBF0', padding: '6px 14px', borderRadius: 10, border: '1px solid #FFE4A0' }}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 800 }}>{Number(user.rating).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 16, overflowX: 'auto' }} className="no-scrollbar">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
              borderRadius: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700,
              color: activeTab === tab.key ? 'white' : 'var(--text-muted)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              border: 'none',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.key ? '0 8px 20px rgba(107, 79, 58, 0.2)' : 'none'
            }}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'listings' && (
          loadingData ? (
            <div className="items-grid" style={{ marginTop: 24 }}>
              {Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: 24, border: '1px dashed var(--border)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <ShoppingBag size={32} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No active listings</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>You haven't posted any items for sale yet.</p>
              <Link to="/sell" className="btn-primary" style={{ padding: '0 32px' }}>Start Selling</Link>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>My Marketplace Listings ({listings.length})</h2>
                <Link to="/sell" className="btn-primary" style={{ padding: '0 20px', height: 40, fontSize: 13 }}>+ New Item</Link>
              </div>
              <div className="items-grid">
                {listings.map(item => (
                  <div key={item._id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <ItemCard item={item} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      {item.status === 'available' ? (
                        <button onClick={() => handleMarkSold(item._id)} style={{ flex: 1, height: 40, borderRadius: 10, background: 'white', border: '1px solid #34d399', color: '#059669', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          Mark Sold
                        </button>
                      ) : (
                        <button onClick={() => handleMarkAvailable(item._id)} style={{ flex: 1, height: 40, borderRadius: 10, background: 'white', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          Relist Item
                        </button>
                      )}
                      <button onClick={() => handleDeleteItem(item._id)} style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {activeTab === 'borrow' && (
          loadingData ? (
            <div className="items-grid" style={{ marginTop: 24 }}>
              {Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : borrowListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: 24, border: '1px dashed var(--border)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <RefreshCw size={32} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No items for rent</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>You haven't listed any items for peer-to-peer sharing.</p>
              <Link to="/borrow/create" className="btn-primary" style={{ padding: '0 32px' }}>List for Rent</Link>
            </div>
          ) : (
            <div className="items-grid">{borrowListings.map(item => <BorrowCard key={item._id} item={item} />)}</div>
          )
        )}

        {activeTab === 'orders' && (
          transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: 24, border: '1px dashed var(--border)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CreditCard size={32} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No transactions</h3>
              <p style={{ color: 'var(--text-muted)' }}>Purchase history will appear here once you buy or rent items.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {transactions.map(tx => (
                <div key={tx._id} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  {(tx.item?.images?.[0] || tx.borrowItem?.images?.[0]) && (
                    <img src={tx.item?.images?.[0] || tx.borrowItem?.images?.[0]} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>
                      {tx.item?.title || tx.borrowItem?.title || 'Marketplace Item'}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                      <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', fontSize: 11 }}>{tx.type === 'buy' ? 'Purchase' : 'Rental'}</span>
                      <span>{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 20, fontFamily: 'Outfit, sans-serif', color: 'var(--text)', marginBottom: 4 }}>₹{tx.amount?.toLocaleString('en-IN')}</div>
                    <span className={`badge ${tx.status === 'completed' ? 'badge-success' : tx.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ padding: '4px 12px' }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'settings' && (
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid var(--border)', padding: '40px', maxWidth: 700, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 32, fontFamily: 'Outfit, sans-serif' }}>Profile Settings</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.02em' }}>FULL NAME</label>
                  <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" style={{ background: '#f9fafb' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.02em' }}>PHONE NUMBER</label>
                  <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9999999999" style={{ background: '#f9fafb' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.02em' }}>COLLEGE / INSTITUTE</label>
                <select className="input" name="college" value={form.college} onChange={handleChange} style={{ appearance: 'none', cursor: 'pointer', background: '#f9fafb' }}>
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.02em' }}>COURSE / DEPARTMENT</label>
                  <input className="input" name="course" value={form.course} onChange={handleChange} placeholder="e.g. Computer Science" style={{ background: '#f9fafb' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.02em' }}>CURRENT YEAR</label>
                  <input className="input" name="year" value={form.year} onChange={handleChange} placeholder="e.g. 3rd Year" style={{ background: '#f9fafb' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.02em' }}>BIO</label>
                <textarea className="input" name="bio" value={form.bio} onChange={handleChange} placeholder="Tell others what you buy, sell or borrow..." style={{ minHeight: 120, resize: 'vertical', background: '#f9fafb' }} />
              </div>
              <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 8 }}>
                <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0 32px', height: 48, fontSize: 15 }}>
                  {saving ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCropper && selectedImage && (
          <ImageCropper
            image={selectedImage}
            onCropComplete={handleCropComplete}
            onCancel={() => { setShowCropper(false); setSelectedImage(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
