const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Google Auth Controller — find or create user, return JWT
exports.googleAuth = async (req, res) => {
  const { name, email, googleId } = req.body;

  try {
    if (!email || !googleId)
      return res.status(400).json({ message: 'Invalid Google data.' });

    // Find existing user or auto-create
    let user = await User.findOne({ email });

    if (!user) {
      // Auto-create account for Google users (no password needed)
      user = new User({
        name,
        email,
        password: `google_${googleId}`, // placeholder — Google users don't use password login
      });
      await user.save();
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Google auth successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
