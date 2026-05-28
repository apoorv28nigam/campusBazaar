import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { fadeUp, btnTap, ease, dur } from '../components/animations/motionConfig';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear location state after reading it to avoid persistence on refresh
    if (location.state?.email) {
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter email and password');

    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      
      if (res.data.token) {
        // Update AuthContext synchronously so isAuth becomes true before navigation
        // We pass null for supabaseSession as we now rely on JWT
        login(null, res.data.mongoUser, res.data.token);
        toast.success('Logged in successfully!');
        navigate('/buy');
      }
    } catch (err) {
      if (err.response?.data?.notVerified) {
        toast.error('Please verify your email first.');
        // We could redirect to a verify screen if we wanted, but the backend requires OTP flow.
      } else {
        toast.error(err.response?.data?.message || err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: dur.md, ease: ease.out }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(107, 79, 58, 0.2)', cursor: 'pointer' }}
          >
            <ShoppingCart size={32} color="white" />
          </motion.div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            Campus<span style={{ color: 'var(--primary)' }}>Bazaar</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 16 }}>Secure Student Marketplace</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card auth-card"
        >
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Welcome Back</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                  style={{ paddingLeft: 46, background: '#f9fafb', height: 56, fontSize: 15 }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  style={{ paddingLeft: 46, paddingRight: 46, background: '#f9fafb', height: 56, fontSize: 15 }}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(p => !p)} 
                  style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--text)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                  Forgot Password?
                </Link>
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
                <><span>Sign In</span><ArrowRight size={20} /></>
              )}
            </motion.button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}
        >
          By continuing, you agree to CampusBazaar's <br />
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>Terms of Service</span> and <span style={{ fontWeight: 600, color: 'var(--text)' }}>Privacy Policy</span>
        </motion.p>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; }
      `}</style>
    </div>
  );
}
