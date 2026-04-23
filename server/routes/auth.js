const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { supabaseAdmin, supabaseClient } = require('../config/supabase');
const { sendOTPEmail } = require('../config/email');

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
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

/**
 * @desc  Verify OTP and create/login session
 * @route POST /api/auth/otp/verify
 */
router.post('/otp/verify', async (req, res) => {
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

    // 5. Create/Login User natively without magic links
    const tempPassword = crypto.randomUUID();
    let user;

    // Check if user exists
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    const existingUser = usersData.users.find(u => u.email === email);

    if (existingUser) {
      // Update existing user's password to login
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: tempPassword,
        email_confirm: true
      });
      if (updateError) throw updateError;
      user = updatedUser.user;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true
      });
      if (createError) throw createError;
      user = newUser.user;
    }

    // Sign in with the temporary password to get a valid session
    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: tempPassword
    });

    if (signInError) throw signInError;

    // 6. Upsert profile in our public.profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: user.id, email: email }, { onConflict: 'email' });

    if (profileError) console.error('❌ Profile Upsert Error:', profileError);

    // 7. Find or create MongoDB User and generate standard JWT
    let mongoUser = await User.findOne({ email });
    if (!mongoUser) {
      mongoUser = await User.create({
        email,
        name: email.split('@')[0], // Default name
        supabaseId: user.id,
        isVerified: true
      });
    } else if (!mongoUser.supabaseId) {
      mongoUser.supabaseId = user.id;
      await mongoUser.save();
    }

    const token = jwt.sign({ id: mongoUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    // Return the session back to the client
    res.json({ 
      success: true, 
      message: 'Verified successfully', 
      session: sessionData.session,
      user: user,
      token,
      mongoUser
    });

  } catch (err) {
    console.error('❌ Verify OTP Error:', err.message);
    res.status(500).json({ message: 'Verification failed' });
  }
});

module.exports = router;
