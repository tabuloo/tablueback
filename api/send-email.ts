import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Expect the following env vars to be configured in Vercel project settings:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("true" or "false")

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html } = req.body || {};
    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@tabuloo.app';

    await transporter.sendMail({
      from: `Tabuloo <${fromAddress}>`,
      to,
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Email send failed:', error);
    return res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
}



