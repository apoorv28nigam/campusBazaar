import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone, Plus, X, Search, Filter, Clock, CheckCircle,
  ChevronDown, Tag, DollarSign, FileText, MessageCircle,
  ShoppingBag, RefreshCw, Sparkles, User
} from 'lucide-react';
import { requestsAPI, messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../components/Loader';

const CATEGORIES = ['General', 'Books', 'Electronics', 'Clothing', 'Sports', 'Stationery', 'Furniture', 'Musical Instruments', 'Lab Equipment', 'Other'];
const TYPE_LABELS = { 
  buy: { label: 'To Buy', color: '#5E8C61', bg: 'rgba(94, 140, 97, 0.12)', icon: ShoppingBag }, 
  rent: { label: 'To Rent', color: '#C67C4E', bg: 'rgba(198, 124, 78, 0.12)', icon: RefreshCw }, 
  both: { label: 'Buy or Rent', color: '#6B4F3A', bg: 'rgba(107, 79, 58, 0.12)', icon: Sparkles } 
};

function BroadcastModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'both', budget: '', category: 'General' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return toast.error('Please fill title and description');
    setLoading(true);
    try {
      await requestsAPI.create(form);
      toast.success('📢 Your request has been broadcast to all users!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(60, 47, 47, 0.4)', backdropFilter: 'blur(8px)' }} />

      {/* Modal */}
      <div className="card animate-slide-down" style={{ position: 'relative', width: '100%', maxWidth: 520, padding: 32, borderRadius: 24, zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(107, 79, 58, 0.2)' }}>
            <Megaphone size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>Broadcast a Request</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Ask all CampusCart users if they have what you need</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>WHAT ARE YOU LOOKING FOR? *</label>
            <div style={{ position: 'relative' }}>
              <FileText size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Physics textbook, Laptop..."
                style={{ paddingLeft: 42, background: '#f9fafb' }} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>LOOKING TO...</label>
              <select className="input" name="type" value={form.type} onChange={handleChange} style={{ background: '#f9fafb' }}>
                <option value="buy">To Buy</option>
                <option value="rent">To Rent</option>
                <option value="both">Buy or Rent</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>CATEGORY</label>
              <select className="input" name="category" value={form.category} onChange={handleChange} style={{ background: '#f9fafb' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>DESCRIPTION *</label>
            <textarea className="input" name="description" value={form.description} onChange={handleChange}
              placeholder="Describe what you need, condition expected, etc..."
              rows={3}
              style={{ resize: 'vertical', minHeight: 100, paddingTop: 12, background: '#f9fafb' }}
              required />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 10, letterSpacing: '0.02em' }}>BUDGET (₹) (OPTIONAL)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" name="budget" value={form.budget} onChange={handleChange}
                placeholder="0" type="number" min="0" style={{ paddingLeft: 42, background: '#f9fafb' }} />
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 16, background: 'var(--primary-light)', border: '1px solid rgba(107, 79, 58, 0.1)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Megaphone size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
              Your request will be broadcasted to <strong style={{ color: 'var(--primary)' }}>all verified users</strong>. Helper students will message you directly.
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: 56, fontSize: 16, marginTop: 8 }}>
            {loading ? <Loader2 size={24} className="animate-spin" /> : <><Megaphone size={20} /><span>Broadcast Request</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function RequestCard({ request, onRespond, currentUserId }) {
  const [responding, setResponding] = useState(false);
  const typeInfo = TYPE_LABELS[request.type] || TYPE_LABELS.both;
  const TypeIcon = typeInfo.icon;
  const isOwn = request.requester?._id === currentUserId;
  const hasResponded = request.responses?.includes(currentUserId);

  const handleRespond = async () => {
    setResponding(true);
    try {
      await onRespond(request._id);
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <img src={request.requester?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester?.name || 'U')}&background=6B4F3A&color=fff`}
          alt="avatar" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>
            {request.requester?.name || 'Unknown User'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
            <Clock size={12} />
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </div>
        </div>

        {/* Type badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: 'var(--primary-light)', border: `1px solid rgba(107, 79, 58, 0.1)`, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{typeInfo.label}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'Outfit, sans-serif', lineHeight: 1.3 }}>
          {request.title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {request.description}
        </p>
      </div>

      {/* Footer Info */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        {request.category && (
          <span className="badge badge-primary">{request.category}</span>
        )}
        {request.budget && (
          <span className="badge" style={{ background: 'rgba(198, 124, 78, 0.1)', color: 'var(--warning)', border: '1px solid rgba(198, 124, 78, 0.2)' }}>₹{request.budget}</span>
        )}
        <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
          {request.responses?.length || 0} RESPONSES
        </div>
      </div>

      {/* Action */}
      {!isOwn && (
        <button
          onClick={handleRespond}
          disabled={responding || hasResponded}
          className={hasResponded ? 'btn-outline' : 'btn-primary'}
          style={{ width: '100%', height: 48, justifyContent: 'center', padding: '0', fontSize: 14, borderRadius: 12 }}
        >
          {responding ? (
            <Loader2 size={18} className="animate-spin" />
          ) : hasResponded ? (
            <><CheckCircle size={18} /><span>You Responded</span></>
          ) : (
            <><MessageCircle size={18} /><span>I Can Help!</span></>
          )}
        </button>
      )}
      {isOwn && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', padding: '10px 0', background: 'var(--bg)', borderRadius: 10, fontWeight: 600 }}>
          <User size={14} style={{ display: 'inline', marginRight: 6, opacity: 0.6 }} />
          Your request · {request.responses?.length || 0} responses
        </div>
      )}
    </div>
  );
}

export default function Requests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchRequests = useCallback(async (p = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const params = { page: p };
      if (filter !== 'all') params.type = filter;
      const res = await requestsAPI.getAll(params);
      if (append) {
        setRequests(prev => [...prev, ...res.data.requests]);
      } else {
        setRequests(res.data.requests);
      }
      setHasMore(p < res.data.pages);
      setPage(p);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchRequests(1); }, [fetchRequests]);

  const handleRespond = async (requestId) => {
    try {
      const res = await requestsAPI.respond(requestId);
      toast.success('✅ Opening chat with the requester!');
      navigate(`/messages/${res.data.conversationId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond');
    }
  };

  const filteredRequests = requests.filter(r =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(107, 79, 58, 0.2)' }}>
                  <Megaphone size={22} color="white" />
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>Community Requests</h1>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6, maxWidth: 500 }}>Browse what fellow students are looking for — or broadcast your own request to the campus.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ height: 52, padding: '0 28px', fontSize: 15, borderRadius: 12 }}>
              <Plus size={20} /><span>Broadcast Request</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', padding: '12px', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          {/* Search */}
          <div style={{ flex: 2, minWidth: 260, position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search request title or desc..." style={{ paddingLeft: 44, background: '#f9fafb', height: 48, borderRadius: 12 }} />
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', padding: 4, borderRadius: 10 }}>
            {['all', 'buy', 'rent'].map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: 'none',
                background: filter === t ? 'white' : 'transparent',
                color: filter === t ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: filter === t ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.02em'
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading && page === 1 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {Array(6).fill(null).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 32, border: '1px dotted var(--border)' }}>
            <Megaphone size={64} color="var(--border)" style={{ margin: '0 auto 20px', display: 'block' }} />
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>No requests found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Be the first to broadcast a request to the campus!</p>
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '14px 28px' }}>
              <Plus size={20} /><span>Make a Request</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filteredRequests.map(request => (
              <RequestCard
                key={request._id}
                request={request}
                onRespond={handleRespond}
                currentUserId={user?._id}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <button onClick={() => fetchRequests(page + 1, true)} className="btn-outline" style={{ height: 48, padding: '0 32px', borderRadius: 12 }}>
              <ChevronDown size={18} /> Load more requests
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <BroadcastModal
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchRequests(1)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
