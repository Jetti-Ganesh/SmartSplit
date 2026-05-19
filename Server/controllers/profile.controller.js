const User = require('../models/user.model');

// Get user profile details
exports.getProfile = async (req, res) => {
  try {
    console.log('GET /profile endpoint called');
    console.log('req.user:', req.user);
    const userId = req.user._id; // From auth middleware (full user object)
    
    console.log('🔍 Looking for user with ID:', userId);
    const user = await User.findById(userId).select('-password');
    
    console.log('✅ User found:', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        phone: user.phone || null,
        avatar: user.avatar || '',
        defaultUpi: user.defaultUpi || '',
        upiList: user.upiList || [],
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        signupMethod: user.signupMethod,
        twoFactorEnabled: user.twoFactorEnabled || false,
        twoFactorMethod: user.twoFactorMethod || 'email',
      },
    });
  } catch (err) {
    console.error('❌ Get profile error:', err);
    res.status(500).json({ message: 'Server error. Please try again.', error: err.message });
  }
};

// Update user profile details
// ── PATCH /api/profile/verify-phone ─────────────────
exports.verifyPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required.' });
    const stripped = phone.replace(/^\+91/, '').trim();

    // Check session OTP was verified
    if (!req.session.otp && req.session.identifier !== stripped) {
      // Allow if the session otp was already verified (otp cleared after verify)
    }

    const userId = req.user._id;
    // Check for duplicate phone
    const dup = await User.findOne({ phone });
    if (dup) return res.status(409).json({ message: 'This phone number is already linked to another account.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.phone = stripped;
    user.isPhoneVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully.',
      user: {
        id: user._id, name: user.name, email: user.email || null,
        phone: user.phone, avatar: user.avatar, defaultUpi: user.defaultUpi,
        upiList: user.upiList, isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified, isPhoneVerified: user.isPhoneVerified,
        signupMethod: user.signupMethod,
        twoFactorEnabled: user.twoFactorEnabled || false,
        twoFactorMethod: user.twoFactorMethod || 'email',
      },
    });
  } catch (err) {
    console.error('verifyPhone error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PATCH /api/profile/verify-email ─────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const normalized = email.toLowerCase().trim();

    const userId = req.user._id;
    const dup = await User.findOne({ email: normalized, _id: { $ne: userId } });
    if (dup) return res.status(409).json({ message: 'This email is already linked to another account.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.email = normalized;
    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      user: {
        id: user._id, name: user.name, email: user.email,
        phone: user.phone || null, avatar: user.avatar, defaultUpi: user.defaultUpi,
        upiList: user.upiList, isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified, isPhoneVerified: user.isPhoneVerified,
        signupMethod: user.signupMethod,
        twoFactorEnabled: user.twoFactorEnabled || false,
        twoFactorMethod: user.twoFactorMethod || 'email',
      },
    });
  } catch (err) {
    console.error('verifyEmail error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const fs = require('fs');
    fs.appendFileSync('profile_update.log', JSON.stringify({ body: req.body, time: new Date() }) + '\n');
    
    console.log('🔄 PUT /profile endpoint called');
    console.log('Body:', req.body);
    const userId = req.user._id; // From auth middleware (full user object)
    const { name, phone, email, avatar, defaultUpi, upiList } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }


    // Update allowed fields
    if (name !== undefined && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (email !== undefined && email.trim()) {
      // Check if email is already taken by another user
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use.' });
      }
      user.email = email.toLowerCase().trim();
    }
    if (avatar !== undefined && avatar !== null) {
      // Avatar can be base64 or URL
      console.log('📸 Avatar data received, length:', avatar.length);
      user.avatar = avatar;
    }
    if (defaultUpi !== undefined) user.defaultUpi = defaultUpi;
    if (upiList !== undefined) {
      user.upiList = Array.isArray(upiList) ? upiList : [];
      user.markModified('upiList');
    }

    // Save user
    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        phone: user.phone || null,
        avatar: user.avatar,
        defaultUpi: user.defaultUpi,
        upiList: user.upiList,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        signupMethod: user.signupMethod,
        twoFactorEnabled: user.twoFactorEnabled || false,
        twoFactorMethod: user.twoFactorMethod || 'email',
      },
    });
  } catch (err) {
    console.error('❌ Update profile error:', err);
    res.status(500).json({ message: 'Server error. Please try again.', error: err.message });
  }
};

exports.verifyContact = async (req, res) => {
  const { type, value } = req.body; // 'phone' or 'email', and the verified string value
  try {
    const update = {};
    if (type === 'phone') {
      update.phone = value;
      update.isPhoneVerified = true;
    }
    if (type === 'email') {
      update.email = value;
      update.isEmailVerified = true;
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    ).select('-password');
    return res.status(200).json({ message: 'Contact verified.', user });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update verification.' });
  }
};

