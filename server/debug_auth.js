const fs = require('fs');
const content = fs.readFileSync('/Users/apoorvnigam/Desktop/campusBazaar/campusBazaar/server/routes/auth.js', 'utf8');

const newContent = content.replace(
  "router.post('/otp/send', async (req, res) => {",
  "router.post('/otp/send', async (req, res) => {\n  console.log('--- HIT /otp/send ---');\n  return res.json({ test: true });"
);

fs.writeFileSync('/Users/apoorvnigam/Desktop/campusBazaar/campusBazaar/server/routes/auth.js', newContent);
