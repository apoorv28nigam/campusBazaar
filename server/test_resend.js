const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log("Testing Resend API...");
  const { data, error } = await resend.emails.send({
    from: 'CampusBazaar <noreply@campusbazaar.online>',
    to: 'apoorvnigam@gmail.com', // random test email, doesn't matter much if it fails
    subject: 'Test Email',
    html: '<p>Testing resend</p>'
  });

  if (error) {
    console.error("Resend returned an error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success! Data:", data);
  }
}

testEmail();
