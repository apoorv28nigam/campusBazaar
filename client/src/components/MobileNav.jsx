import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, PlusCircle, RefreshCw, MessageCircle, Megaphone } from 'lucide-react';

const tabs = [
  { to: '/buy', icon: ShoppingBag, label: 'Buy' },
  { to: '/sell', icon: PlusCircle, label: 'Sell' },
  { to: '/', icon: Home, label: 'Home' },
  { to: '/requests', icon: Megaphone, label: 'Requests' },
  { to: '/messages', icon: MessageCircle, label: 'Chat' },
];

export default function MobileNav() {
  const location = useLocation();

  // Hide mobile nav on specific chat windows to give full screen to the chat input
  if (location.pathname.match(/^\/messages\/.+/)) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -10px 40px rgba(107, 79, 58, 0.08)',
      display: 'none', alignItems: 'center', justifyContent: 'space-around',
      padding: '10px 8px max(env(safe-area-inset-bottom), 16px)',
    }} className="mobile-nav">
      {tabs.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
        return (
          <Link key={to} to={to} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: active ? 'var(--primary)' : 'var(--text-muted)', textDecoration: 'none',
            transition: 'all 0.2s', padding: '4px 12px',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'var(--primary-light)' : 'transparent',
              transition: 'all 0.2s',
            }}>
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, letterSpacing: '0.01em', marginTop: 2 }}>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
