import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, MessageCircle, ShoppingBag, RefreshCw, CreditCard, Star, Megaphone } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { SkeletonList } from '../components/Loader';
import toast from 'react-hot-toast';

const ICONS = {
  message: MessageCircle, item_sold: ShoppingBag, borrow_request: RefreshCw,
  borrow_accepted: RefreshCw, borrow_rejected: RefreshCw, payment: CreditCard, review: Star, system: Bell,
  broadcast_request: Megaphone, broadcast_response: MessageCircle,
};
const COLORS = {
  message: '#6B4F3A', // Primary Brown
  item_sold: '#5E8C61', // Muted Green
  borrow_request: '#C67C4E', // Warm Orange
  borrow_accepted: '#5E8C61', 
  borrow_rejected: '#A65D57', // Muted Red/Terracotta
  payment: '#8B5E3C', 
  review: '#D4A373', 
  system: '#6B4F3A',
  broadcast_request: '#8B5E3C', 
  broadcast_response: '#5E8C61',
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.getAll()
      .then(res => { setNotifications(res.data.notifications); setUnreadCount(res.data.unreadCount); })
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationsAPI.markRead();
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success('All marked as read');
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    await notificationsAPI.delete(id);
    setNotifications(p => p.filter(n => n._id !== id));
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      await notificationsAPI.markOneRead(notif._id);
      setNotifications(p => p.map(n => n._id === notif._id ? { ...n, read: true } : n));
      setUnreadCount(p => Math.max(0, p - 1));
    }
    if (notif.link) navigate(notif.link);
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-container" style={{ maxWidth: 680 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>Notifications</h1>
            {unreadCount > 0 && <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{unreadCount} new alerts</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13, background: 'white', border: '1px solid var(--border)' }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonList count={6} />
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 24, border: '1px dashed var(--border)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Bell size={32} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>All caught up!</h3>
            <p style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(notif => {
              const Icon = ICONS[notif.type] || Bell;
              const color = COLORS[notif.type] || '#6B4F3A';
              return (
                <div key={notif._id} onClick={() => handleClick(notif)} style={{
                  display: 'flex', gap: 16, padding: 20, borderRadius: 18, cursor: notif.link ? 'pointer' : 'default',
                  background: notif.read ? 'white' : 'rgba(107, 79, 58, 0.04)',
                  border: `1px solid ${notif.read ? 'var(--border)' : 'rgba(107, 79, 58, 0.15)'}`,
                  transition: 'all 0.2s', position: 'relative', alignItems: 'flex-start',
                  boxShadow: notif.read ? 'none' : '0 4px 12px rgba(107, 79, 58, 0.05)'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15`, border: `1px solid ${color}30`, flexShrink: 0 }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>{notif.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>{notif.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, opacity: 0.8 }}>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                    {!notif.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />}
                    <button onClick={(e) => deleteNotif(notif._id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
