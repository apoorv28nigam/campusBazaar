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
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -1px 3px rgba(0,0,0,0.05)',
      display: 'none', alignItems: 'center', justifyContent: 'space-around',
      padding: '8px 0 env(safe-area-inset-bottom, 12px)',
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
              width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'var(--primary-light)' : 'transparent',
              transition: 'all 0.2s',
            }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.01em' }}>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
