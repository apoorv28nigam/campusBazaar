import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Calendar, Shield, Image, FileText } from 'lucide-react';
import { borrowAPI } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['books','electronics','clothing','furniture','sports','stationery','tools','other'];
const CONDITIONS = ['new','like-new','good','fair'];

export default function CreateBorrow() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ title: '', description: '', rentPerDay: '', securityDeposit: '', category: '', condition: 'good', availableFrom: '', availableTo: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - images.length);
    setImages(p => [...p, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i) => {
    setImages(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.rentPerDay || !form.securityDeposit || !form.category || !form.availableFrom || !form.availableTo) {
      return toast.error('Please fill all required fields');
    }
    if (new Date(form.availableTo) <= new Date(form.availableFrom)) return toast.error('End date must be after start date');

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      images.forEach(img => data.append('images', img));

      const res = await borrowAPI.create(data);
      toast.success('Item listed for rent!');
      navigate(`/borrow/${res.data._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 700 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, marginBottom: 32, fontFamily: 'Outfit, sans-serif', padding: 0 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>Rent Your Item</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500, marginBottom: 40 }}>Share your unused belongings with the campus community</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Images */}
          <div className="card" style={{ padding: 32, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif' }}>
              <Image size={22} color="var(--primary)" /> Item Photos ({images.length}/5)
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 100, height: 100, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', background: '#A65D57', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button type="button" onClick={() => fileRef.current?.click()} style={{ width: 100, height: 100, borderRadius: 16, border: '2px dashed var(--border)', background: 'var(--bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--primary)', transition: 'all 0.2s' }}>
                  <Upload size={22} /><span style={{ fontSize: 11, fontWeight: 800 }}>ADD</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
          </div>

          {/* Main info */}
          <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif' }}>
              <FileText size={22} color="var(--primary)" /> Item Details
            </h3>
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Title <span style={{ color: '#A65D57' }}>*</span></label>
              <input className="input" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Canon DSLR Camera" required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Description <span style={{ color: '#A65D57' }}>*</span></label>
              <textarea className="input" name="description" value={form.description} onChange={handleChange} placeholder="Describe your item, usage instructions, etc..." required style={{ minHeight: 120, resize: 'vertical', paddingTop: 14 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Category <span style={{ color: '#A65D57' }}>*</span></label>
                <select className="input" name="category" value={form.category} onChange={handleChange} required style={{ appearance: 'none', cursor: 'pointer' }}>
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Condition</label>
                <select className="input" name="condition" value={form.condition} onChange={handleChange} style={{ appearance: 'none', cursor: 'pointer' }}>
                  {CONDITIONS.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif' }}>
              <Shield size={22} color="var(--primary)" /> Rental Terms
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Rent per Day (₹) <span style={{ color: '#A65D57' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 800 }}>₹</span>
                  <input className="input" type="number" name="rentPerDay" value={form.rentPerDay} onChange={handleChange} min="0" placeholder="50" style={{ paddingLeft: 36 }} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Security Deposit <span style={{ color: '#A65D57' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 800 }}>₹</span>
                  <input className="input" type="number" name="securityDeposit" value={form.securityDeposit} onChange={handleChange} min="0" placeholder="200" style={{ paddingLeft: 36 }} required />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Available From</label>
                <input className="input" type="date" name="availableFrom" value={form.availableFrom} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Available Until</label>
                <input className="input" type="date" name="availableTo" value={form.availableTo} onChange={handleChange} min={form.availableFrom || new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary" style={{ flex: 1, padding: '16px', fontSize: 16, fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}>Discard</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', padding: '16px', fontSize: 16, fontWeight: 800, boxShadow: '0 8px 20px rgba(107, 79, 58, 0.2)' }}>
              {loading ? 'Processing...' : 'Ready to Rent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
