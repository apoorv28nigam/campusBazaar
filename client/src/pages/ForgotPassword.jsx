import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { fadeUp, btnTap, ease, dur } from '../components/animations/motionConfig';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.md, ease: ease.out }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '16px', background: 'var(--primary)', color: 'white', marginBottom: 24, boxShadow: '0 8px 32px rgba(107, 79, 58, 0.2)' }}>
            <Mail size={32} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Forgot Password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.5 }}>
            {success ? "Check your email for a reset link." : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card auth-card"
          style={{ padding: '40px 32px', background: 'white', borderRadius: 24, boxShadow: '0 12px 48px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}
        >
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Check your inbox</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32 }}>We've sent a password reset link to <strong>{email}</strong>.</p>
              
              <Link to="/login" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', padding: '14px', height: 52 }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu.in"
                    style={{ paddingLeft: 46, background: '#f9fafb', height: 56, fontSize: 15, border: '1px solid #e5e7eb', borderRadius: 12, width: '100%', outline: 'none', transition: 'all 0.2s' }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <motion.button
                {...btnTap}
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, height: 56 }}
              >
                {loading ? (
                  <div className="spinner" style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <><span>Send Reset Link</span><ArrowRight size={18} /></>
                )}
              </motion.button>
            </form>
          )}

          {!success && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--text)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; }
        .input:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 4px var(--primary-light) !important; }
      `}</style>
    </div>
  );
}
