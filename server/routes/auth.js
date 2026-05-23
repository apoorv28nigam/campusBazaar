const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { supabaseAdmin, supabaseClient } = require('../config/supabase');
const { sendOTPEmail } = require('../config/email');
const { protect } = require('../middleware/auth');

/**
 * @desc  Get current logged-in user (session restore)
 * @route GET /api/auth/me
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('❌ /me Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @desc  Send 6-digit OTP to email
 * @route POST /api/auth/otp/send
 */
router.post('/otp/send', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // 1. Rate Limiting: Max 3 requests per minute per email
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from('otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gt('created_at', oneMinuteAgo);

    if (countError) throw countError;
    if (count >= 3) {
      return res.status(429).json({ message: 'Too many OTP requests. Please wait a minute.' });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // 4. Store in database
    const { error: insertError } = await supabaseAdmin
      .from('otp_codes')
      .insert([{ email, otp: hashedOtp, expires_at: expiresAt }]);

    if (insertError) throw insertError;

    // 5. Send Email via Resend
    await sendOTPEmail(email, otp);

    console.log(`[AUTH] OTP sent to ${email}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('❌ Send OTP Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @desc  Register new user & send OTP
 * @route POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, course, year } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please provide all required fields' });

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'User already exists and is verified' });
      }
      // If not verified, we can update details and send new OTP
      user.name = name;
      user.password = password; // Will be hashed by pre-save hook
      if (college) user.college = college;
      if (course) user.course = course;
      if (year) user.year = year;
    } else {
      user = new User({
        name,
        email,
        password,
        college,
        course,
        year,
        isVerified: false
      });
    }

    await user.save();

    // 1. Rate Limiting: Max 3 requests per minute per email
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from('otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gt('created_at', oneMinuteAgo);

    if (countError) throw countError;
    if (count >= 3) {
      return res.status(429).json({ message: 'Too many OTP requests. Please wait a minute.' });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // 4. Store in database
    const { error: insertError } = await supabaseAdmin
      .from('otp_codes')
      .insert([{ email, otp: hashedOtp, expires_at: expiresAt }]);

    if (insertError) throw insertError;

    // 5. Send Email via Resend
    await sendOTPEmail(email, otp);

    res.status(201).json({ success: true, message: 'Registration successful, OTP sent' });
  } catch (err) {
    console.error('❌ /register Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @desc  Verify Registration OTP
 * @route POST /api/auth/register/verify
 */
router.post('/register/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    // 1. Fetch latest OTP for this email
    const { data: codes, error: fetchError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;
    if (!codes || codes.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP or expired' });
    }

    const latestOtp = codes[0];

    // 2. Check expiry
    if (new Date(latestOtp.expires_at) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // 3. Verify Match
    const isMatch = await bcrypt.compare(otp, latestOtp.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // 4. Success -> Delete used OTP
    await supabaseAdmin.from('otp_codes').delete().eq('email', email);

    // 5. Mark user as verified
    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully. Please log in.' });
  } catch (err) {
    console.error('❌ /register/verify Error:', err.message);
    res.status(500).json({ message: 'Verification failed' });
  }
});

/**
 * @desc  Login user & get token
 * @route POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first', notVerified: true });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({ message: 'Please use Forgot Password to set a password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    res.json({
      success: true,
      token,
      mongoUser: user,
      user: { id: user.supabaseId || user._id, email: user.email } // Dummy session user for frontend compat
    });
  } catch (err) {
    console.error('❌ /login Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
