async function testOtp() {
  try {
    console.log("Sending OTP request...");
    const res = await fetch('http://localhost:5001/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@glbitm.ac.in' })
    });
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testOtp();
