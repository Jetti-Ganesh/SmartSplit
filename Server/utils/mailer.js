const nodemailer = require('nodemailer');

// ✅ CORRECT - Use SMTP instead of service: "Gmail"
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,  // ⚠️ IMPORTANT: false for port 587
  auth: {
    user: process.env.EMAIL_USER,      // your-email@gmail.com
    pass: process.env.EMAIL_PASS       // Gmail App Password
  }
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
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your SplitSmart OTP Code',
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
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email Sent:', info.response);
    return { success: true, message: 'OTP sent to email' };
    
  } catch (error) {
    console.error('❌ Email Send Error:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send Welcome Email
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to SplitSmart! 🎉',
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
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome Email Sent to:', email);
    
  } catch (error) {
    console.error('❌ Welcome Email Error:', error.message);
    // Don't throw - this is not critical
  }
};