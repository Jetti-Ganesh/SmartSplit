const mailer = require('../utils/mailer');
const crypto = require('crypto');
const Otp = require('../models/otp.model');
const { verifyPhone } = require('./profile.controller');
const User = require('../models/user.model');

const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

const cleanupExpiredOtps = () => {
  const now = Date.now();
  for (const [key, record] of otpStore) {
    if (record.expiresAt <= now) {
      otpStore.delete(key);
    }
  }
};

const normalizeIdentifier = (email, phone) => {
  if (email) {
    return String(email).trim().toLowerCase();
  }
  if (phone) {
    return String(phone).replace(/\D/g, '').slice(-10);
  }
  return null;
};

exports.sendOtp = async (req, res) => {
  cleanupExpiredOtps();

  const { email, phone } = req.body;
  const isEmailValid = email && String(email).trim() !== '' && String(email) !== 'undefined' && String(email) !== 'null';
  const isPhoneValid = phone && String(phone).trim() !== '' && String(phone) !== 'undefined' && String(phone) !== 'null';

  if (!isEmailValid && !isPhoneValid) {
    return res.status(400).json({ message: 'Email or phone number is required.' });
  }

  const OTP = generateOTP();
  const identifier = normalizeIdentifier(isEmailValid ? email : null, isPhoneValid ? phone : null);
  if (identifier) {
    otpStore.set(identifier, {
      otp: OTP,
      expiresAt: Date.now() + OTP_TTL_MS,
    });
    // Store in MongoDB with auto-TTL
    try {
      await Otp.deleteMany({ identifier });
      await Otp.create({ identifier, otp: OTP });
      console.log(`✅ Persisted OTP for ${identifier} in MongoDB`);
    } catch (dbErr) {
      console.error('⚠️ Failed to persist OTP in MongoDB:', dbErr.message);
    }
  }

  req.session.otp = OTP;
  req.session.otpIdentifier = identifier;

  if (isEmailValid) {
    try {
      const result = await mailer.sendOTP(email, OTP);
      if (result && result.success === false) {
        return res.status(400).json({ message: result.message || 'Failed to send email OTP.' });
      }
      return res.status(200).json({ message: 'OTP sent to your email.' });
    } catch (err) {
      console.error('Email OTP error:', err);
      return res.status(500).json({ message: err.message || 'Failed to send email OTP.' });
    }
  }

  if (isPhoneValid) {
    // Normalize phone — strip spaces, +91, leading 0
    let normalized = phone.replace(/\s+/g, '').replace(/^(\+91|0)/, '');
    const clean10Digits = normalized.slice(-10);
    const withCountryCode = `+91${clean10Digits}`;
    if(clean10Digits.length !== 10 || !/^\d{10}$/.test(clean10Digits)) {
      return res.status(400).json({ message: 'Invalid phone number format.' });
    }
    const dup = await User.findOne({ phone });
    if (dup) return res.status(409).json({ message: 'This phone number is already linked to another account.' });

    let smsSentReal = false;

    // 3. Fallback: print to console and always return the generated OTP so they can complete signup instantly!
    console.log(`[DEV OTP HINT] Phone OTP for ${withCountryCode}: ${OTP}`);

    if (smsSentReal) {
      return res.status(200).json({
        message: 'OTP sent to your mobile number.',
        devOtp: OTP
      });
    } else {
      return res.status(200).json({
        message: 'OTP sent (Dev Mode fallback - check server console).',
        devOtp: OTP
      });
    }
  }
};

exports.verifyOtp = async (req, res) => {
  cleanupExpiredOtps();
  const { enteredOtp, email, phone } = req.body;

  const identifier = normalizeIdentifier(email, phone);

  // 1. Try DB-backed verification first (robust against server restarts & session loss)
  if (identifier) {
    try {
      const record = await Otp.findOne({ identifier });
      if (record) {
        if (record.otp !== enteredOtp) {
          return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }
        // Mark as verified in DB
        record.verified = true;
        await record.save();

        req.session.otpVerified = true;
        req.session.otpIdentifier = identifier;
        console.log(`✅ Verified OTP for ${identifier} in MongoDB`);
        return res.status(200).json({ message: 'OTP verified successfully.' });
      }
    } catch (dbErr) {
      console.error('⚠️ DB OTP verification failed:', dbErr.message);
    }
  }

  // 2. In-memory fallback
  if (identifier && otpStore.has(identifier)) {
    const record = otpStore.get(identifier);
    if (!record || record.expiresAt <= Date.now()) {
      otpStore.delete(identifier);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    if (record.otp !== enteredOtp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
    otpStore.delete(identifier);
    req.session.otpVerified = true;
    req.session.otpIdentifier = identifier;
    return res.status(200).json({ message: 'OTP verified successfully.' });
  }

  if (!req.session.otp) {
    return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
  }
  if (req.session.otp === enteredOtp) {
    req.session.otpVerified = true;
    req.session.otpIdentifier = identifier || req.session.otpIdentifier;
    return res.status(200).json({ message: 'OTP verified successfully.' });
  }
  return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
};
