import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, ShoppingCart, ArrowRight, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import OTPInput from '../components/auth/OTPInput';
import toast from 'react-hot-toast';
import { fadeUp, staggerContainer, btnTap, ease, dur, scaleIn } from '../components/animations/motionConfig';

const COLLEGES = ['GL Bajaj Institute of Technology and Management, Greater Noida'];
const COURSE_YEARS = {
  'B.Tech': ['1st Year', '2nd Year', '3rd Year', '4th Year'],
  'BBA': ['1st Year', '2nd Year', '3rd Year'],
  'BCA': ['1st Year', '2nd Year', '3rd Year'],
  'MBA': ['1st Year', '2nd Year'],
  'MCA': ['1st Year', '2nd Year'],
  'M.Tech': ['1st Year', '2nd Year'],
  'PGDM': ['1st Year', '2nd Year'],
};
const COURSES = Object.keys(COURSE_YEARS);

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', course: '', year: '', otp: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
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

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setStep(2);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.college) return toast.error('Please select your college');
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Account created! OTP sent to your email.');
      setStep(3);
      setTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setLoading(true);
    try {
      const res = await authAPI.verifyRegister(form.email, otp);
      toast.success(res.data.message || 'Email verified successfully!');
      navigate('/login', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid OTP');
      setResetTrigger(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: ease.out }}
          style={{ textAlign: 'center', marginBottom: 36 }}
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(107, 79, 58, 0.2)', cursor: 'pointer' }}
          >
            <ShoppingCart size={28} color="white" />
          </motion.div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>Join CampusBazaar</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Create your verified student account</p>
        </motion.div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: step >= s ? 'var(--primary)' : 'rgba(107, 79, 58, 0.1)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card auth-card"
          style={{ overflow: 'hidden' }}
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1, x: 0,
                    transition: { duration: 0.3, ease: ease.out, staggerChildren: 0.08, delayChildren: 0.1 }
                  },
                  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
                }}
                onSubmit={handleNext}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step 1: Personal Info</div>

                <motion.div variants={fadeUp}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8 }}>FULL NAME</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" type="text" name="name" value={form.name} onChange={handleChange}
                      placeholder="Your full name" style={{ paddingLeft: 42, background: '#f9fafb' }} required />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8 }}>EMAIL</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="enter your email" style={{ paddingLeft: 42, background: '#f9fafb' }} required />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8 }}>PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                      placeholder="Min. 6 characters" style={{ paddingLeft: 42, paddingRight: 42, background: '#f9fafb' }} required />
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  variants={fadeUp}
                  {...btnTap}
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', height: 56, justifyContent: 'center', padding: '0', fontSize: 16, marginTop: 4 }}
                >
                  <span>Next Step</span><ArrowRight size={18} />
                </motion.button>
              </motion.form>
            ) : step === 2 ? (
              <motion.form
                key="step2"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: {
                    opacity: 1, x: 0,
                    transition: { duration: 0.3, ease: ease.out, staggerChildren: 0.08, delayChildren: 0.1 }
                  },
                  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
                }}
                onSubmit={handleSendOtp}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step 2: College Info</div>

                <motion.div variants={fadeUp}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8 }}>COLLEGE / UNIVERSITY</label>
                  <div style={{ position: 'relative' }}>
                    <GraduationCap size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1 }} />
                    <select className="input" name="college" value={form.college} onChange={handleChange} required style={{ paddingLeft: 42, appearance: 'none', cursor: 'pointer', background: '#f9fafb', color: 'var(--text)' }}>
                      <option value="" disabled>Select your college</option>
                      {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8 }}>COURSE</label>
                  <div style={{ position: 'relative' }}>
                    <BookOpen size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1 }} />
                    <select className="input" name="course" value={form.course} onChange={(e) => setForm(f => ({ ...f, course: e.target.value, year: '' }))} required style={{ paddingLeft: 42, appearance: 'none', cursor: 'pointer', background: '#f9fafb', color: 'var(--text)' }}>
                      <option value="" disabled>Select your course</option>
                      {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 8 }}>YEAR OF STUDY</label>
                  <select className="input" name="year" value={form.year} onChange={handleChange} required disabled={!form.course} style={{ appearance: 'none', cursor: form.course ? 'pointer' : 'not-allowed', background: '#f9fafb', color: 'var(--text)', opacity: form.course ? 1 : 0.5 }}>
                    <option value="" disabled>Select year</option>
                    {form.course && COURSE_YEARS[form.course]?.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </motion.div>

                {/* Benefits */}
                <motion.div variants={fadeUp} style={{ padding: 16, borderRadius: 16, background: 'rgba(94, 140, 97, 0.05)', border: '1px solid rgba(94, 140, 97, 0.15)' }}>
                  {['Access to campus-only listings', 'Verified student badge', 'Secure in-campus transactions'].map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                      <CheckCircle size={14} color="var(--accent)" /> {b}
                    </div>
                  ))}
                </motion.div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button {...btnTap} type="button" onClick={() => setStep(1)} className="btn-outline" style={{ flex: 1, height: 52, padding: '0', fontSize: 15 }}>Back</motion.button>
                  <motion.button {...btnTap} type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, height: 52, justifyContent: 'center', padding: '0', fontSize: 15 }}>
                    {loading ? <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} /> : <><span>Next Step</span><ArrowRight size={18} /></>}
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="step3"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: {
                    opacity: 1, x: 0,
                    transition: { duration: 0.3, ease: ease.out, staggerChildren: 0.08, delayChildren: 0.1 }
                  },
                  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
                }}
              >
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ShieldCheck size={24} color="var(--primary)" />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Verify Email</h2>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                    We sent a 6-digit code to <br />
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{form.email}</span>
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
                    onClick={handleSendOtp}
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

        <div style={{ textAlign: 'center', marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
