// Lightweight local serverless-style contact handler for the static portfolio.
// Usage:
//   1) npm init -y
//   2) npm i express nodemailer dotenv
//   3) set env vars (see below)
//   4) node contact-email-server.js
// Then configure the frontend endpoint from '/api/contact' to 'http://localhost:PORT/api/contact' if needed.

// Use CommonJS so it works without forcing ESM.
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();
console.log("SMTP_HOST =", process.env.SMTP_HOST);
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("SMTP_PASS =", process.env.SMTP_PASS ? "Loaded" : "Missing");

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL; // optional but recommended

const TO_EMAIL = process.env.TO_EMAIL || 'chopadepranav01@gmail.com';

let transporter;
try {
  // If using Gmail, SMTP_HOST= smtp.gmail.com and SMTP_PORT=587
  transporter = nodemailer.createTransport({
    host: requireEnv('SMTP_HOST'),
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS')
    }
  });
} catch (e) {
  // Don’t crash immediately in some build systems; throw on first request.
}

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing fields.' });
    }

    // Basic email sanity check
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
    if (!emailOk) {
      return res.status(400).json({ ok: false, error: 'Invalid email.' });
    }

    if (!process.env.SMTP_HOST) {
      return res.status(500).json({ ok: false, error: 'Email service not configured.' });
    }

    const to = TO_EMAIL;
    const from = FROM_EMAIL || SMTP_USER;

    const mailOptions = {
      from,
      to,
      subject: `Portfolio Contact: ${name}`,
      text: `New message from your portfolio\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`,
      html: `<p><strong>New message from your portfolio</strong></p><p><strong>Name:</strong> ${String(name).replace(/</g, '<')}</p><p><strong>Email:</strong> ${String(email).replace(/</g, '<')}</p><p><strong>Message:</strong><br/>${String(message).replace(/</g, '<').replace(/\n/g, '<br/>')}</p>`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact send error:', err);
    return res.status(500).json({
  ok: false,
  error: err.message
});
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Contact email server listening on port ${port}`);
});

