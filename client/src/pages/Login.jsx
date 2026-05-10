import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ShoppingCart, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import OTPInput from '../components/auth/OTPInput';
import { fadeUp, btnTap, ease, dur } from '../components/animations/motionConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      await authAPI.sendOtp(email);
      toast.success('OTP sent to your email!');
      setStep(2);
      setTimer(30); // 30s cooldown for resend
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(email, otp);

      if (res.data.session) {
        if (res.data.token) {
          localStorage.setItem('cc_token', res.data.token);
          localStorage.setItem('cc_user', JSON.stringify(res.data.mongoUser));
        }

        const { error } = await supabase.auth.setSession({
          access_token: res.data.session.access_token,
          refresh_token: res.data.session.refresh_token,
        });

        if (error) throw error;

        toast.success('Verified successfully!');
        navigate('/buy');
      } else {
        throw new Error('Failed to establish session.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid OTP');
      setResetTrigger(prev => prev + 1); // Clear OTP inputs on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
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
          className="card"
          style={{ padding: '40px 32px' }}
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: 24, textAlign: 'center' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Welcome Back</h2>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Enter your email to receive a 6-digit code</p>
                </div>

                <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                      <><span>Continue</span><ArrowRight size={20} /></>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ShieldCheck size={24} color="var(--primary)" />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Verify Email</h2>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                    We sent a 6-digit code to <br />
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{email}</span>
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, marginTop: 8, cursor: 'pointer' }}
                  >
                    Change Email
                  </button>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <OTPInput onComplete={handleVerifyOTP} resetTrigger={resetTrigger} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleSendOTP}
                    disabled={timer > 0 || loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      margin: '0 auto',
                      background: 'none',
                      border: 'none',
                      color: timer > 0 ? 'var(--text-muted)' : 'var(--primary)',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: timer > 0 ? 'default' : 'pointer',
                      opacity: timer > 0 ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {timer > 0 ? (
                      `Resend OTP in ${timer}s`
                    ) : (
                      <><RefreshCw size={16} /> Resend OTP</>
                    )}
                  </button>
                </div>

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <div className="spinner" style={{ width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Verifying...
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
