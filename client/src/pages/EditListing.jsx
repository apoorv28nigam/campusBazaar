import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonDetail } from '../components/Loader';
import toast from 'react-hot-toast';

const CATEGORIES = ['books','electronics','clothing','furniture','sports','stationery','food','other'];
const CONDITIONS = ['new','like-new','good','fair','poor'];
const STATUSES = ['available','reserved','sold'];

export default function EditListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', condition: '', status: '', tags: '', location: '' });
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    itemsAPI.getOne(id)
      .then(res => {
        const i = res.data;
        if (i.seller._id !== user?._id) { toast.error('Not authorized'); navigate('/'); return; }
        setItem(i);
        setForm({ title: i.title, description: i.description, price: i.price, category: i.category, condition: i.condition, status: i.status, tags: i.tags?.join(', ') || '', location: i.location || '' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - newImages.length);
    setNewImages(p => [...p, ...files]);
    files.forEach(f => { const r = new FileReader(); r.onload = ev => setNewPreviews(p => [...p, ev.target.result]); r.readAsDataURL(f); });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      newImages.forEach(img => data.append('images', img));
      await itemsAPI.update(id, data);
      toast.success('Listing updated!');
      navigate(`/buy/${id}`);
    } catch (e) { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) return <SkeletonDetail />;
  if (!item) return <div style={{ textAlign: 'center', padding: 80 }}>Item not found</div>;

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 700 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, marginBottom: 32, fontFamily: 'Outfit, sans-serif', padding: 0 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>Edit Listing</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500, marginBottom: 40 }}>Update your item details below</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Existing images */}
          {item.images?.length > 0 && (
            <div className="card" style={{ padding: 24, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Images</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {item.images.map((src, i) => (
                  <img key={i} src={src} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }} />
                ))}
              </div>
            </div>
          )}

          {/* New images */}
          <div className="card" style={{ padding: 24, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Replace Images</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {newPreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => { setNewImages(p => p.filter((_, j) => j !== i)); setNewPreviews(p => p.filter((_, j) => j !== i)); }} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: '#A65D57', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              {newImages.length < 5 && (
                <button type="button" onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 12, border: '2px dashed var(--border)', background: 'var(--bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--primary)', transition: 'all 0.2s' }}>
                  <Upload size={20} /><span style={{ fontSize: 11, fontWeight: 800 }}>ADD</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
          </div>

          <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24, border: '1px solid var(--border)' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
              <input className="input" name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
              <textarea className="input" name="description" value={form.description} onChange={handleChange} style={{ minHeight: 120, resize: 'vertical', paddingTop: 14 }} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price (₹)</label>
                <input className="input" type="number" name="price" value={form.price} onChange={handleChange} min="0" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                <select className="input" name="category" value={form.category} onChange={handleChange} style={{ appearance: 'none', cursor: 'pointer' }}>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                <select className="input" name="status" value={form.status} onChange={handleChange} style={{ appearance: 'none', cursor: 'pointer' }}>
                  {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condition</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {CONDITIONS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, condition: c }))} style={{
                    padding: '10px 20px', borderRadius: 14, border: `1px solid ${form.condition === c ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.condition === c ? 'var(--primary-light)' : 'white',
                    color: form.condition === c ? 'var(--primary)' : 'var(--text-muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</label>
                <input className="input" name="tags" value={form.tags} onChange={handleChange} placeholder="maths, sem3, books" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                <input className="input" name="location" value={form.location} onChange={handleChange} placeholder="Hostel Block A" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary" style={{ flex: 1, padding: '16px', fontSize: 16, fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}>Discard</button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 2, justifyContent: 'center', padding: '16px', fontSize: 16, fontWeight: 800, boxShadow: '0 8px 20px rgba(107, 79, 58, 0.2)' }}>
              <Save size={20} /><span>{saving ? 'Updating Listing...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
