const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

async function addNotificationToUser(userId, message, type = 'info') {
  return User.findByIdAndUpdate(
    userId,
    {
      $push: {
        notifications: {
          type,
          message,
          isRead: false,
          createdAt: new Date()
        }
      }
    },
    { new: true }
  );
}
const mailer = require('../utils/mailer');
// ── Login ─────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  const { email, phone, password } = req.body;
  try {
    if ((!email && !phone) || !password)
      return res.status(400).json({ message: 'Credentials and password are required.' });

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      const normalized = phone.replace(/\s+/g, '').replace(/^(\+91|0)/, '');
      user = await User.findOne({ phone: normalized });
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    try {
      await addNotificationToUser(user._id, 'Logged in successfully.', 'success');
    } catch (notifyErr) {
      console.error('Notification save failed:', notifyErr);
    }

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        signupMethod: user.signupMethod,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── Sign Up ────────────────────────────────────────────
exports.signUpUser = async (req, res) => {
  const { name, email, phone, password, signupMethod } = req.body;
  try {
    if (!name || !password)
      return res.status(400).json({ message: 'Name and password are required.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (signupMethod === 'email' && !email)
      return res.status(400).json({ message: 'Email is required.' });
    if (signupMethod === 'phone' && !phone)
      return res.status(400).json({ message: 'Phone number is required.' });

    const identifier = signupMethod === 'email'
      ? String(email).trim().toLowerCase()
      : String(phone).replace(/\D/g, '').slice(-10);

    if (!req.session?.otpVerified || (req.session.otpIdentifier && req.session.otpIdentifier !== identifier)) {
      return res.status(400).json({ message: 'OTP not verified for this contact. Please verify before signing up.' });
    }

    // Check duplicates
    if (email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: 'Email already registered.' });
    }
    if (phone) {
      const normalized = phone.replace(/\s+/g, '').replace(/^(\+91|0)/, '');
      const exists = await User.findOne({ phone: normalized });
      if (exists) return res.status(409).json({ message: 'Phone number already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      password: hashedPassword,
      signupMethod: signupMethod || 'email',
    };

    if (signupMethod === 'email') {
      userData.email = email;
      userData.isEmailVerified = true;
    } else {
      userData.phone = phone.replace(/\s+/g, '').replace(/^(\+91|0)/, '');
      userData.isPhoneVerified = true;
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    req.session.otp = null;
    req.session.otpVerified = false;
    req.session.otpIdentifier = null;
    await mailer.sendWelcomeEmail(email , name); // Send welcome email with name as part before @
    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        signupMethod: user.signupMethod,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message || 'Server error.' });
  }
};

// ── Change Password ────────────────────────────────────
exports.changePassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: 'Passwords do not match.' });
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.user._id, { password: hashed });
    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ── Enable 2FA ─────────────────────────────────────────
exports.enable2FA = async (req, res) => {
  const { method } = req.body;
  try {
    await User.findByIdAndUpdate(req.user._id, { 
      twoFactorEnabled: true, 
      twoFactorMethod: method || 'email' 
    });
    return res.status(200).json({ message: '2FA enabled successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ── Disable 2FA ────────────────────────────────────────
exports.disable2FA = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: false });
    return res.status(200).json({ message: '2FA disabled.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

