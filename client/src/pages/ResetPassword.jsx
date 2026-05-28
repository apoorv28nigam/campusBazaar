import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { fadeUp, btnTap, ease, dur } from '../components/animations/motionConfig';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, newPassword);
      setSuccess(true);
      toast.success('Password has been successfully reset!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
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
            <Lock size={32} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Set New Password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.5 }}>
            {success ? "Your password has been successfully updated." : "Please enter your new password below."}
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
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
              >
                <CheckCircle size={32} />
              </motion.div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Password Reset!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32 }}>Redirecting you to login...</p>
              
              <Link to="/login" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', padding: '14px', height: 52 }}>
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>NEW PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="input"
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    style={{ paddingLeft: 46, paddingRight: 46, background: '#f9fafb', height: 56, fontSize: 15, border: '1px solid #e5e7eb', borderRadius: 12, width: '100%', outline: 'none', transition: 'all 0.2s' }}
                    required
                    autoFocus
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPass(p => !p)} 
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
                  >
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>CONFIRM PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="input"
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    style={{ paddingLeft: 46, paddingRight: 46, background: '#f9fafb', height: 56, fontSize: 15, border: '1px solid #e5e7eb', borderRadius: 12, width: '100%', outline: 'none', transition: 'all 0.2s' }}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPass(p => !p)} 
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                {...btnTap}
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, height: 56, marginTop: 8 }}
              >
                {loading ? (
                  <div className="spinner" style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <><span>Reset Password</span><ArrowRight size={18} /></>
                )}
              </motion.button>
            </form>
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
