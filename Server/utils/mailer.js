const { Resend } = require('resend');
const User = require('../models/user.model');

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
  console.warn('❌ RESEND_API_KEY is not set. Email sending will fail.');
} else {
  console.log('✅ Resend client initialized.');
}
const nodemailer = require('nodemailer');

const cleanEnvValue = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.trim().replace(/^['"]+|['"]+$/g, '');
};

const EMAIL_USER = cleanEnvValue(process.env.EMAIL_USER);
const EMAIL_PASS = cleanEnvValue(process.env.EMAIL_PASS);

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❌ Missing email credentials: set EMAIL_USER and EMAIL_PASS in environment variables.');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  socketTimeout: 10000
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Config Error:', error);
  } else {
    console.log('✅ Email Service Ready!');
  }
});

// Send OTP Email
exports.sendOTP = async (email, otp) => {
  const exists = await User.findOne({ email });
  if (exists)
    return { success: false, message: 'Email Already Registered' };
  try {
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const response = await resend.emails.send({
      from,
      to: email,
      subject: 'Your SplitSmart OTP Code',
      text: `Your SplitSmart OTP Code is: ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h2>Your OTP Code</h2>
          <p>Use this code to verify your SplitSmart account:</p>
          <div style="background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px; font-size: 32px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code expires in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });
    console.log('✅ OTP Email Sent:', response.id || response);
    return { success: true, message: 'OTP sent to email' };

  } catch (error) {
    console.error('❌ Email Send Error:', error.message, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send Welcome Email
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    await resend.emails.send({
      from,
      to: email,
      subject: 'Welcome to SplitSmart! 🎉',
      text: `Welcome to SplitSmart, ${name}! Your account is ready.`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width:600px; margin:0 auto; background:#f8fafc; border-radius:10px; overflow:hidden; box-shadow:0 6px 18px rgba(15,23,42,0.06);">
          <div style="padding:18px; text-align:center; background:linear-gradient(90deg,#06b6d4 0%,#7c3aed 100%); color:#fff;">
            <h1 style="margin:0; font-size:20px; font-weight:700;">Welcome to SplitSmart</h1>
          </div>
          <div style="padding:20px; color:#111;">
            <h2 style="margin:0 0 8px 0; font-size:18px;">Hi ${name} 👋</h2>
            <p style="margin:0 0 12px 0; color:#374151; line-height:1.5;">Your SplitSmart account is ready. Track expenses, split bills, and keep friendships drama-free.</p>
            <a href="#" style="display:inline-block; background:#10B981; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none; font-weight:600;">Get started</a>
            <p style="margin:16px 0 0 0; font-size:12px; color:#6b7280;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `
    });
    console.log('✅ Welcome Email Sent to:', email);

  } catch (error) {
    console.error('❌ Welcome Email Error:', error.message);
    // Don't throw - this is not critical
  }
};