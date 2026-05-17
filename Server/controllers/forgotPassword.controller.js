const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const transporter = require('../utils/mailer');
const User = require('../models/user.model');

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ── POST /api/forgot-password ────────────────────────
exports.sendResetOtp = async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) {
    return res.status(400).json({ message: 'Email or phone is required.' });
  }

  const OTP = generateOTP();
  const identifier = email ? email.toLowerCase().trim() : phone.replace(/^\+91/, '').trim();

  // Find user so we know the account exists
  const query = email ? { email: identifier } : { phone: identifier };
  const user = await User.findOne(query);
  if (!user) {
    return res.status(404).json({ message: email ? 'No account found with this email.' : 'No account found with this phone number.' });
  }

  req.session.resetOtp = OTP;
  req.session.resetIdentifier = identifier;
  req.session.resetIsEmail = !!email;
  req.session.resetVerified = false;

  if (email) {
    // Send via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: identifier,
      subject: 'SmartSplit — Password Reset OTP',
      html: `<h3>Password Reset Request</h3>
             <p>Use the OTP below to reset your SmartSplit password:</p>
             <h2 style="letter-spacing:8px;color:#6d28d9;">${OTP}</h2>
             <p>This OTP is valid for 10 minutes. Ignore this email if you did not request a reset.</p>`,
    };
    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'Reset OTP sent' });
    } catch (err) {
      console.error('Error sending reset email:', err);
      return res.status(500).json({ message: 'Error sending reset email.' });
    }
  } else {
    // Replace with Twilio/MSG91 in production
    console.log(`[DEV] Password reset OTP for ${identifier}: ${OTP}`);
    return res.status(200).json({ message: 'Reset OTP sent', devOtp: OTP });
  }
};

// ── POST /api/verify-reset-otp ───────────────────────
exports.verifyResetOtp = async (req, res) => {
  const { otp } = req.body;
  if (!req.session.resetOtp) {
    return res.status(400).json({ message: 'No OTP session found. Please request a new OTP.' });
  }
  if (req.session.resetOtp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  }
  req.session.resetVerified = true;
  res.status(200).json({ message: 'OTP verified', success: true });
};

// ── POST /api/reset-password ─────────────────────────
exports.resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  if (!req.session.resetVerified) {
    return res.status(403).json({ message: 'OTP not verified. Please verify your OTP first.' });
  }
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Both password fields are required.' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const identifier = req.session.resetIdentifier;
  const isEmail = req.session.resetIsEmail;
  const query = isEmail ? { email: identifier } : { phone: identifier };

  const user = await User.findOne(query);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Clear reset session
  req.session.resetOtp = null;
  req.session.resetIdentifier = null;
  req.session.resetVerified = false;
  req.session.resetIsEmail = null;

  res.status(200).json({ message: 'Password reset successfully' });
};
