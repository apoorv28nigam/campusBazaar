const axios = require('axios'); // We can use node's native http
const http = require('http');

const data = JSON.stringify({ email: 'test@glbitm.ac.in' });

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/otp/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let resData = '';
  res.on('data', d => resData += d);
  res.on('end', () => console.log('Response:', resData));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
