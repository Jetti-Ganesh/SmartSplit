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
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${name}!</h2>
          <p>Your SplitSmart account is ready.</p>
          <p>Start splitting expenses with friends and never fight over money again!</p>
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