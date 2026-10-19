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
// ── Login ─────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  const { username, email, phone, password } = req.body;
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured.');

    const identifier = String(username || email || phone || '').trim();
    if (!identifier || !password)
      return res.status(400).json({ message: 'Credentials and password are required.' });

    let user = await User.findOne({ username: identifier.toLowerCase() });
    if (!user && identifier.includes('@')) {
      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {
      const normalizedPhone = identifier.replace(/\s+/g, '').replace(/^(\+91|0)/, '');
      if (!user && /^\d{10,}$/.test(normalizedPhone)) {
        user = await User.findOne({ phone: normalizedPhone });
      }
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
        username: user.username,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        signupMethod: user.signupMethod,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── Sign Up ────────────────────────────────────────────
exports.signUpUser = async (req, res) => {
  const { name, username, password } = req.body;
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured.');

    const normalizedName = String(name || '').trim();
    const normalizedUsername = String(username || '').trim().toLowerCase();
    if (!normalizedName || !normalizedUsername || typeof password !== 'string')
      return res.status(400).json({ message: 'Name, username, and password are required.' });
    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername))
      return res.status(400).json({ message: 'Username must be 3-30 characters using letters, numbers, or underscores.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const exists = await User.findOne({ username: normalizedUsername });
    if (exists) return res.status(409).json({ message: 'Username already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name: normalizedName,
      username: normalizedUsername,
      password: hashedPassword,
      signupMethod: 'username',
    };

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        signupMethod: user.signupMethod,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000 && err.keyPattern?.username) {
      return res.status(409).json({ message: 'Username already registered.' });
    }
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
