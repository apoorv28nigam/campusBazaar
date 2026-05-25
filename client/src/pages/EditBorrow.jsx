import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, X, Save, Shield, Calendar, Image as ImageIcon,
  MapPin, FileText, Trash2, AlertTriangle, CheckCircle, PauseCircle,
  PlayCircle, Clock, RefreshCw, Package
} from 'lucide-react';
import { borrowAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonDetail } from '../components/Loader';
import ListingImageAdjuster from '../components/ListingImageAdjuster';
import toast from 'react-hot-toast';

const CATEGORIES = ['books','electronics','clothing','furniture','sports','stationery','tools','other'];
const CONDITIONS = ['new','like-new','good','fair'];

const STATUS_CONFIG = {
  available:   { label: 'Available',    icon: CheckCircle,   color: '#15803D', bg: '#F0FDF4', border: '#DCFCE7', desc: 'Visible to everyone. Anyone can request to borrow.' },
  paused:      { label: 'Paused',       icon: PauseCircle,   color: '#B45309', bg: '#FFFBF0', border: '#FFE4A0', desc: 'Temporarily hidden. No new requests will come in.' },
  borrowed:    { label: 'Lent Out',     icon: RefreshCw,     color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', desc: 'Item is currently with a borrower.' },
};

export default function EditBorrow() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [item, setItem]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', rentPerDay: '', securityDeposit: '',
    category: '', condition: 'good', availableFrom: '', availableTo: '', location: '',
  });
  const [imageFit, setImageFit]       = useState('contain');
  const [existingImages, setExisting] = useState([]);
  const [newImages, setNewImages]     = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [adjustingIdx, setAdjustingIdx] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('available');

  /* ── Load listing ── */
  useEffect(() => {
    borrowAPI.getOne(id)
      .then(res => {
        const i = res.data;
        if (i.owner._id !== user?._id) {
          toast.error('Not authorized');
          navigate('/borrow');
          return;
        }
        setItem(i);
        setCurrentStatus(i.status || 'available');
        setExisting(i.images || []);
        setImageFit(i.imageFit || 'contain');
        setForm({
          title:           i.title,
          description:     i.description,
          rentPerDay:      i.rentPerDay,
          securityDeposit: i.securityDeposit,
          category:        i.category,
          condition:       i.condition || 'good',
          availableFrom:   i.availableFrom?.split('T')[0] || '',
          availableTo:     i.availableTo?.split('T')[0]   || '',
          location:        i.location || '',
        });
      })
      .catch(() => { toast.error('Listing not found'); navigate('/borrow'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  /* ── New image selection ── */
  const handleImages = e => {
    const files = Array.from(e.target.files).slice(0, 5 - newImages.length);
    setNewImages(p => [...p, ...files]);
    files.forEach(f => {
      const r = new FileReader();
      r.onload = ev => setNewPreviews(p => [...p, ev.target.result]);
      r.readAsDataURL(f);
    });
  };
  const removeNew = i => {
    setNewImages(p => p.filter((_, j) => j !== i));
    setNewPreviews(p => p.filter((_, j) => j !== i));
  };

  /* ── Save changes ── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description || !form.rentPerDay || !form.securityDeposit || !form.category) {
      return toast.error('Please fill all required fields');
    }
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('imageFit', imageFit);
      newImages.forEach(img => data.append('images', img));
      await borrowAPI.update(id, data);
      toast.success('Listing updated successfully!');
      navigate(`/borrow/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  /* ── Status change ── */
  const handleStatusChange = async newStatus => {
    if (newStatus === currentStatus) return;
    setStatusLoading(true);
    try {
      await borrowAPI.markStatus(id, newStatus);
      setCurrentStatus(newStatus);
      setItem(prev => ({ ...prev, status: newStatus }));
      toast.success(`Listing marked as ${STATUS_CONFIG[newStatus]?.label}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  /* ── Delete listing ── */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await borrowAPI.delete(id);
      toast.success('Listing removed');
      navigate('/borrow');
    } catch (err) {
      toast.error('Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <SkeletonDetail />;
  if (!item)   return null;

  const totalImages = existingImages.length + newImages.length;

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 780 }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, marginBottom: 32, padding: 0 }}>
          <ArrowLeft size={18} /> Back
        </button>

        {/* Page heading */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(198,124,78,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={16} color="var(--primary)" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Manage Rental Listing</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', marginBottom: 6 }}>
            {item.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            <Clock size={13} />
            Last updated: {new Date(item.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* ── Availability Controls Card ── */}
        <div className="card" style={{ padding: 28, border: '1px solid var(--border)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 6, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={18} color="var(--primary)" /> Availability Controls
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, fontWeight: 500 }}>
            Control who can see and request your listing.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isActive = currentStatus === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={statusLoading}
                  onClick={() => handleStatusChange(key)}
                  style={{
                    flex: '1 1 160px',
                    padding: '16px 18px',
                    borderRadius: 16,
                    border: `2px solid ${isActive ? cfg.color : 'var(--border)'}`,
                    background: isActive ? cfg.bg : 'white',
                    cursor: statusLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    opacity: statusLoading ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Icon size={16} color={isActive ? cfg.color : 'var(--text-muted)'} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: isActive ? cfg.color : 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {cfg.label}
                    </span>
                    {isActive && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, background: cfg.color, color: 'white', padding: '2px 7px', borderRadius: 99 }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{cfg.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Edit Form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Images */}
          <div className="card" style={{ padding: 28, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif' }}>
              <ImageIcon size={18} color="var(--primary)" /> Item Photos
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginLeft: 'auto' }}>{totalImages}/5</span>
            </h3>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Current Photos</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {existingImages.map((src, i) => (
                    <div key={i} style={{ position: 'relative', width: 90, height: 90, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: imageFit || 'contain' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new images */}
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              {existingImages.length > 0 ? 'Add/Replace Photos' : 'Upload Photos'}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {newPreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 90, height: 90, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--primary)' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeNew(i)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: '#A65D57', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <X size={11} />
                  </button>
                  <button type="button" onClick={() => setAdjustingIdx(i)} style={{ position: 'absolute', bottom: 4, right: 4, padding: '2px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.95)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer', fontSize: 9, fontWeight: 800, zIndex: 10 }}>
                    Adjust
                  </button>
                </div>
              ))}
              {totalImages < 5 && (
                <button type="button" onClick={() => fileRef.current?.click()} style={{ width: 90, height: 90, borderRadius: 12, border: '2px dashed var(--border)', background: 'var(--bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--primary)', transition: 'all 0.2s' }}>
                  <Upload size={20} />
                  <span style={{ fontSize: 10, fontWeight: 800 }}>ADD</span>
                </button>
              )}
            </div>

            {/* Fit selector */}
            <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Image Display</label>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[['contain', 'Fit Entire Image (Recommended)'], ['cover', 'Crop to Fill']].map(([val, lbl]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                    <input type="radio" name="imageFit" value={val} checked={imageFit === val} onChange={() => setImageFit(val)} style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>

            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
            {adjustingIdx !== null && (
              <ListingImageAdjuster
                image={newPreviews[adjustingIdx]}
                onCancel={() => setAdjustingIdx(null)}
                onCropComplete={(blob, url) => {
                  const f = new File([blob], `adjusted_${adjustingIdx}.jpeg`, { type: 'image/jpeg' });
                  setNewImages(p => p.map((img, idx) => idx === adjustingIdx ? f : img));
                  setNewPreviews(p => p.map((u, idx) => idx === adjustingIdx ? url : u));
                  setAdjustingIdx(null);
                }}
              />
            )}
          </div>

          {/* Details */}
          <div className="card" style={{ padding: 28, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif' }}>
              <FileText size={18} color="var(--primary)" /> Item Details
            </h3>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Title <span style={{ color: '#A65D57' }}>*</span>
              </label>
              <input className="input" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Canon DSLR Camera" required />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Description <span style={{ color: '#A65D57' }}>*</span>
              </label>
              <textarea className="input" name="description" value={form.description} onChange={handleChange} placeholder="Describe your item, usage instructions, any wear/tear..." required style={{ minHeight: 120, resize: 'vertical', paddingTop: 14 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Category <span style={{ color: '#A65D57' }}>*</span>
                </label>
                <select className="input" name="category" value={form.category} onChange={handleChange} required style={{ appearance: 'none', cursor: 'pointer' }}>
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Condition</label>
                <select className="input" name="condition" value={form.condition} onChange={handleChange} style={{ appearance: 'none', cursor: 'pointer' }}>
                  {CONDITIONS.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Rental Terms */}
          <div className="card" style={{ padding: 28, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif' }}>
              <Shield size={18} color="var(--primary)" /> Rental Terms
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Rent / Day (₹) <span style={{ color: '#A65D57' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 800 }}>₹</span>
                  <input className="input" type="number" name="rentPerDay" value={form.rentPerDay} onChange={handleChange} min="0" placeholder="50" style={{ paddingLeft: 32 }} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Security Deposit (₹) <span style={{ color: '#A65D57' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 800 }}>₹</span>
                  <input className="input" type="number" name="securityDeposit" value={form.securityDeposit} onChange={handleChange} min="0" placeholder="200" style={{ paddingLeft: 32 }} required />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />Available From
                </label>
                <input className="input" type="date" name="availableFrom" value={form.availableFrom} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />Available Until
                </label>
                <input className="input" type="date" name="availableTo" value={form.availableTo} onChange={handleChange} min={form.availableFrom} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />Pickup / Drop Location
              </label>
              <input className="input" name="location" value={form.location} onChange={handleChange} placeholder="e.g., Hostel Block A, Library Gate, Room 204" />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 14 }}>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary" style={{ flex: 1, padding: '15px', fontSize: 15, fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}>
              Discard
            </button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 2, justifyContent: 'center', padding: '15px', fontSize: 15, fontWeight: 800, boxShadow: '0 8px 20px rgba(107,79,58,0.15)' }}>
              <Save size={18} style={{ marginRight: 8 }} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* ── Danger Zone ── */}
        <div style={{ marginTop: 32, padding: 24, borderRadius: 20, border: '1px solid #FEE2E2', background: '#FFF5F5' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#B91C1C', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} /> Danger Zone
          </h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, fontWeight: 500, lineHeight: 1.5 }}>
            Permanently remove this rental listing. This cannot be undone. Active borrow requests will be cancelled.
          </p>
          {!showDelete ? (
            <button type="button" onClick={() => setShowDelete(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: '1px solid #FCA5A5', background: 'white', color: '#DC2626', cursor: 'pointer', fontSize: 13, fontWeight: 800, transition: 'all 0.2s' }}>
              <Trash2 size={15} /> Delete Listing
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, borderRadius: 14, background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#7F1D1D', margin: 0 }}>
                Are you sure? This will remove the listing from CampusBazaar permanently.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowDelete(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'white', color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} disabled={deleting} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#DC2626', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
