import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function OTPInput({ length = 6, onComplete, resetTrigger }) {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputs = useRef([]);

  useEffect(() => {
    // Autofocus first input on mount
    if (inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Reset OTP if trigger changes
    if (resetTrigger) {
      setOtp(new Array(length).fill(''));
      if (inputs.current[0]) inputs.current[0].focus();
    }
  }, [resetTrigger, length]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are entered (pasting handled separately)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputs.current[index + 1].focus();
    }

    // Auto-submit if complete
    const combined = newOtp.join('');
    if (combined.length === length) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, length);
    if (isNaN(Number(data))) return;

    const newOtp = [...otp];
    data.split('').forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or the one after
    const nextIndex = data.length < length ? data.length : length - 1;
    inputs.current[nextIndex].focus();

    if (data.length === length) {
      onComplete(data);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
      {otp.map((digit, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          style={{
            width: '52px',
            height: '64px',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: '800',
            borderRadius: '16px',
            border: digit ? '2px solid var(--primary)' : '2px solid var(--border)',
            background: digit ? 'white' : '#f9fafb',
            color: 'var(--text)',
            outline: 'none',
            boxShadow: digit ? '0 8px 16px rgba(107, 79, 58, 0.1)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'Outfit, sans-serif'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 4px rgba(107, 79, 58, 0.12)';
            e.target.style.background = 'white';
          }}
          onBlur={(e) => {
            if (!digit) {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
              e.target.style.background = '#f9fafb';
            }
          }}
        />
      ))}
    </div>
  );
}
