import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, ShoppingBag } from 'lucide-react';
import { paymentsAPI } from '../services/api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      paymentsAPI.verify(sessionId)
        .then(res => setTransaction(res.data.transaction))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary)', animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Verifying Transaction...</p>
          </div>
        ) : (
          <>
            {/* Success Animation Area */}
            <div style={{ width: 120, height: 120, borderRadius: 40, background: 'rgba(94, 140, 97, 0.1)', border: '1px solid rgba(94, 140, 97, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -10, borderRadius: 45, border: '2px solid rgba(94, 140, 97, 0.05)', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <CheckCircle size={64} color="#5E8C61" strokeWidth={2} />
            </div>

            <h1 style={{ fontSize: 42, fontWeight: 900, color: 'var(--text)', marginBottom: 16, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>Thank You!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 18, lineHeight: 1.6, marginBottom: 40, fontWeight: 500, maxWidth: 440, margin: '0 auto 40px' }}>
              Your payment was successful. We've notified the seller, and they'll coordinate the campus pickup with you shortly.
            </p>

            {transaction && (
              <div className="card" style={{ padding: 32, textAlign: 'left', marginBottom: 40, border: '1px solid var(--border)', background: 'white', borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Payment Receipt</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Purchase Type</span>
                    <span style={{ color: 'var(--text)', fontWeight: 800, textTransform: 'capitalize', background: 'var(--primary-light)', padding: '4px 12px', borderRadius: 8, fontSize: 13 }}>{transaction.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Amount Paid</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 900, fontFamily: 'Outfit, sans-serif', fontSize: 24 }}>₹{transaction.amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Status</span>
                    <span style={{ color: '#5E8C61', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={16} /> Verified
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/buy" className="btn-primary" style={{ height: 56, padding: '0 32px', fontSize: 16, fontWeight: 800 }}>
                <ShoppingBag size={20} /><span>Continue Shopping</span>
              </Link>
              <Link to="/my-profile" className="btn-secondary" style={{ height: 56, padding: '0 32px', fontSize: 16, fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}>
                <Package size={20} /><span>View Orders</span>
              </Link>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 75%, 100% { transform: scale(1.4); opacity: 0; } }
      `}</style>
    </div>
  );
}
