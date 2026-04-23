const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  try {
    // ALWAYS log the OTP to the console for development/testing
    console.log(`\n=========================================`);
    console.log(`🔐 OTP FOR ${email}: ${otp}`);
    console.log(`=========================================\n`);

    const { data, error } = await resend.emails.send({
      from: 'CampusBazaar <onboarding@resend.dev>',
      to: email,
      subject: 'Your CampusBazaar OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #6B4F3A; text-align: center;">CampusBazaar</h2>
          <p style="font-size: 16px; color: #4a5568;">Hello,</p>
          <p style="font-size: 16px; color: #4a5568;">Your 6-digit OTP code for secure login/registration is:</p>
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 12px; color: #6B4F3A;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #718096; text-align: center;">This code expires in 5 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="font-size: 12px; color: #a0aec0; text-align: center;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API Error (Sandbox limitation?):', error.message);
      console.log('⚠️ Continuing login flow. Please use the OTP printed above.');
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Email Sending Failed:', err.message);
    console.log('⚠️ Continuing login flow. Please use the OTP printed above.');
    return null;
  }
};

module.exports = { sendOTPEmail };
