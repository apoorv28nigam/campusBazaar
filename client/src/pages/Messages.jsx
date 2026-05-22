import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, Clock } from 'lucide-react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonList } from '../components/Loader';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    messagesAPI.getConversations()
      .then(res => setConversations(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = conversations.filter(c => {
    const other = c.participants?.find(p => p._id !== user?._id);
    return !search || other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Messages</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontWeight: 500 }}>{conversations.length} total conversations</p>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} 
            placeholder="Search conversations..." 
            style={{ paddingLeft: 44, background: 'white' }} 
          />
        </div>

        {loading ? (
          <SkeletonList count={5} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 24, border: '1px dashed var(--border)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <MessageCircle size={32} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>No conversations yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Start chatting with sellers from item pages</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(conv => {
              const other = conv.participants?.find(p => p._id !== user?._id);
              const lastMsg = conv.lastMessage;
              return (
                <Link key={conv._id} to={`/messages/${conv._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', gap: 16, padding: '16px 20px', alignItems: 'center', transition: 'all 0.2s', border: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6B4F3A&color=fff&size=52`} 
                        alt={other?.name} style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{other?.name || 'User'}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, fontWeight: 600 }}>
                          <Clock size={12} /> {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', margin: 0 }}>
                          {lastMsg || 'Start a conversation'}
                        </p>
                        {conv.itemRef && (
                          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary)', flexShrink: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {conv.itemRef.title?.substring(0, 15)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
