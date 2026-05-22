const fs = require('fs');

const authContent = `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { supabaseAdmin, supabaseClient } = require('../config/supabase');
const { sendOTPEmail } = require('../config/email');
const { protect } = require('../middleware/auth');

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

router.post('/otp/send', async (req, res) => {
  console.log('--- HIT /otp/send ---');
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    console.log('--- 1. Rate Limiting Check ---');
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from('otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gt('created_at', oneMinuteAgo);

    console.log('--- 1b. Rate Limiting Done ---');
    if (countError) throw countError;
    if (count >= 3) {
      return res.status(429).json({ message: 'Too many OTP requests. Please wait a minute.' });
    }

    console.log('--- 2. Generate OTP ---');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log('--- 3. Hash OTP ---');
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    console.log('--- 4. Store in database ---');
    const { error: insertError } = await supabaseAdmin
      .from('otp_codes')
      .insert([{ email, otp: hashedOtp, expires_at: expiresAt }]);

    console.log('--- 4b. Insert Done ---');
    if (insertError) throw insertError;

    console.log('--- 5. Send Email via Resend ---');
    await sendOTPEmail(email, otp);

    console.log(\`[AUTH] OTP sent to \${email}\`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('❌ Send OTP Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/otp/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

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

    if (new Date(latestOtp.expires_at) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const isMatch = await bcrypt.compare(otp, latestOtp.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await supabaseAdmin.from('otp_codes').delete().eq('email', email);

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    const existingUser = users.find(u => u.email === email);

    let user;
    const tempPassword = crypto.randomUUID();

    if (existingUser) {
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: tempPassword,
        email_confirm: true
      });
      if (updateError) throw updateError;
      user = updatedUser.user;
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true
      });
      if (createError) throw createError;
      user = newUser.user;
    }

    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: tempPassword
    });

    if (signInError) throw signInError;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: user.id, email: email }, { onConflict: 'email' });

    if (profileError) console.error('❌ Profile Upsert Error:', profileError);

    let mongoUser = await User.findOne({ email });
    if (!mongoUser) {
      mongoUser = await User.create({
        email,
        name: email.split('@')[0],
        supabaseId: user.id,
        isVerified: true
      });
    } else if (!mongoUser.supabaseId) {
      mongoUser.supabaseId = user.id;
      await mongoUser.save();
    }

    const token = jwt.sign({ id: mongoUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

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
`;

fs.writeFileSync('/Users/apoorvnigam/Desktop/campusBazaar/campusBazaar/server/routes/auth.js', authContent);
