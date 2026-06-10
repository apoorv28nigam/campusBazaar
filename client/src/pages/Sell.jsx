import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ArrowLeft, Tag, FileText, IndianRupee, Package, Image } from 'lucide-react';
import { itemsAPI } from '../services/api';
import toast from 'react-hot-toast';
import ListingImageAdjuster from '../components/ListingImageAdjuster';

const CATEGORIES = ['books','electronics','clothing','furniture','sports','stationery','food','other'];
const CONDITIONS = ['new','like-new','good','fair','poor'];

export default function Sell() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', condition: 'good', tags: '', location: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFit, setImageFit] = useState('contain');
  const [adjustingIdx, setAdjustingIdx] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - images.length;
    const toAdd = files.slice(0, remaining);
    setImages(p => [...p, ...toAdd]);
    toAdd.forEach(f => {
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
    if (!form.title || !form.description || !form.category) return toast.error('Please fill required fields');
    if (form.price !== '0' && !form.price) return toast.error('Please enter a price (0 for free)');

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('imageFit', imageFit);
      images.forEach(img => data.append('images', img));

      const res = await itemsAPI.create(data);
      toast.success('Item listed successfully!');
      navigate(`/buy/${res.data._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 800 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, marginBottom: 32, fontFamily: 'Inter, sans-serif', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Create Listing</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>List your item in the campus marketplace and get discovered.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Images Section */}
          <div style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image size={18} color="var(--primary)" />
              </div>
              Product Photos <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginLeft: 'auto' }}>{images.length}/5</span>
            </h3>
            
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 120, height: 120, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'white', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}>
                    <X size={14} />
                  </button>
                  <button type="button" onClick={() => setAdjustingIdx(i)} style={{ position: 'absolute', bottom: 8, right: 8, padding: '4px 8px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.95)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}>
                    Adjust
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button 
                  type="button" 
                  onClick={() => fileRef.current?.click()} 
                  style={{
                    width: 120, height: 120, borderRadius: 16, border: '2px dashed #ddd6fe',
                    background: 'var(--primary-light)', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--primary)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#ede9fe'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd6fe'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                >
                  <Upload size={24} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Upload</span>
                </button>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>JPG, PNG or WEBP. Max 5 images.</p>
            
            {/* Image fit option */}
            <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Image Display Options
              </label>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="radio" name="imageFit" value="contain" checked={imageFit === 'contain'} onChange={() => setImageFit('contain')} style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
                  Fit Entire Image (Recommended Default)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="radio" name="imageFit" value="cover" checked={imageFit === 'cover'} onChange={() => setImageFit('cover')} style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
                  Crop to Fill
                </label>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                "Fit Entire Image" keeps the complete photo you uploaded without cropping. "Crop to Fill" will stretch the photo to cover the listing card.
              </p>
            </div>

            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />

            {/* Adjuster popup modal */}
            {adjustingIdx !== null && (
              <ListingImageAdjuster
                image={previews[adjustingIdx]}
                onCancel={() => setAdjustingIdx(null)}
                onCropComplete={(newBlob, newUrl) => {
                  const adjustedFile = new File([newBlob], `adjusted_photo_${adjustingIdx}.jpeg`, { type: 'image/jpeg' });
                  setImages(prev => prev.map((img, idx) => idx === adjustingIdx ? adjustedFile : img));
                  setPreviews(prev => prev.map((url, idx) => idx === adjustingIdx ? newUrl : url));
                  setAdjustingIdx(null);
                }}
              />
            )}
          </div>

          {/* Details Section */}
          <div style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="var(--primary)" />
              </div>
              Item Details
            </h3>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>PRODUCT TITLE <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="input" name="title" value={form.title} onChange={handleChange} placeholder="What are you selling?" style={{ background: '#f9fafb' }} required />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>DESCRIPTION <span style={{ color: 'var(--danger)' }}>*</span></label>
              <textarea 
                className="input" 
                name="description" 
                value={form.description} 
                onChange={handleChange}
                placeholder="Describe your item's condition, features, and key details..." 
                required
                style={{ minHeight: 140, resize: 'vertical', background: '#f9fafb' }} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>CATEGORY <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select className="input" name="category" value={form.category} onChange={handleChange} required style={{ appearance: 'none', cursor: 'pointer', background: '#f9fafb url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat right 16px center / 16px' }}>
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>CONDITION</label>
                <select className="input" name="condition" value={form.condition} onChange={handleChange} style={{ appearance: 'none', cursor: 'pointer', background: '#f9fafb url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat right 16px center / 16px' }}>
                  {CONDITIONS.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={18} color="var(--primary)" />
              </div>
              Set Your Price
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>PRICE (₹) — 0 FOR FREE <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700, fontSize: 16 }}>₹</span>
                  <input className="input" type="number" name="price" value={form.price} onChange={handleChange} min="0" placeholder="0" style={{ paddingLeft: 34, background: '#f9fafb' }} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>PICKUP LOCATION</label>
                <input className="input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Library, Block A" style={{ background: '#f9fafb' }} />
              </div>
            </div>
          </div>

          {/* Tags section */}
          <div style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={18} color="var(--primary)" />
              </div>
              Search Tags
            </h3>
            <input className="input" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. computer, semester-5, tech (comma separated)" style={{ background: '#f9fafb' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>Tags help other students find your item faster.</p>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn-outline" 
              style={{ flex: 1, height: 56, fontSize: 16 }}
            >
              Discard
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading} 
              style={{ flex: 2, height: 56, fontSize: 16, fontWeight: 700 }}
            >
              {loading ? 'Creating Listing...' : 'Publish Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
