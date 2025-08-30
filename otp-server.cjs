// Express server for Twilio OTP
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // allow frontend dev server
  credentials: true
}));
app.use(bodyParser.json());

// Use environment variables for Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const client = twilio(accountSid, authToken);

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;
  try {
    await client.verify.v2.services(serviceSid)
      .verifications.create({ to: `+91${phone}`, channel: 'sms' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const verification_check = await client.verify.v2.services(serviceSid)
      .verificationChecks.create({ to: `+91${phone}`, code: otp });
    if (verification_check.status === 'approved') {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Invalid OTP' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(5000, () => console.log('OTP server running on port 5000'));
