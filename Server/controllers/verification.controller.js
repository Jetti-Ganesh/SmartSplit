const mailer = require('../utils/mailer');
const crypto = require('crypto');

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

exports.sendOtp = async (req, res) => {
  const { email, phone } = req.body;

  const isEmailValid = email && String(email).trim() !== '' && String(email) !== 'undefined' && String(email) !== 'null';
  const isPhoneValid = phone && String(phone).trim() !== '' && String(phone) !== 'undefined' && String(phone) !== 'null';

  if (!isEmailValid && !isPhoneValid) {
    return res.status(400).json({ message: 'Email or phone number is required.' });
  }

  const OTP = generateOTP();
  req.session.otp = OTP;
  req.session.otpIdentifier = isEmailValid ? email : phone;

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

    let smsSentReal = false;

    // 1. Try Fast2SMS since you provided your active key!
    const fast2smsKey = "PQbTRfA7Jpw0slqg8yiuKeoEzIUnG6OcVHFXZS2vW315kjtYm49z8tLj4sekF3Af5rHODlqaJCETb2xK";
    try {
      console.log(`Sending real OTP SMS via Fast2SMS to ${clean10Digits}...`);
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: `Your SplitSmart OTP is: ${OTP}. Valid for 10 minutes. Do not share.`,
          language: 'english',
          numbers: clean10Digits
        })
      });

      const resData = await response.json();
      if (response.ok && resData.return === true) {
        console.log(`SMS successfully sent via Fast2SMS to ${clean10Digits}. Message ID:`, resData.request_id);
        smsSentReal = true;
      } else {
        console.warn('Fast2SMS returned error:', resData.message || resData);
      }
    } catch (err) {
      console.warn('Fast2SMS fetch error:', err.message);
    }

    // 2. If Android Gateway didn't work or was bypassed, try free Textbelt API
    if (!smsSentReal) {
      try {
        console.log(`Attempting to send real SMS via Textbelt free tier to ${withCountryCode}...`);
        const tbResponse = await fetch('https://textbelt.com/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: withCountryCode,
            message: `Your SplitSmart OTP is: ${OTP}. Valid for 10 minutes.`,
            key: 'textbelt',
          }),
        });
        const tbData = await tbResponse.json();
        if (tbResponse.ok && tbData.success) {
          console.log(`SMS successfully sent via Textbelt free tier to ${withCountryCode}.`);
          smsSentReal = true;
        } else {
          console.warn('Textbelt free tier returned error:', tbData.error || 'Quota limit reached');
        }
      } catch (err) {
        console.warn('Textbelt fetch error:', err.message);
      }
    }

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
  const { enteredOtp } = req.body;
  if (!req.session.otp) {
    return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
  }
  if (req.session.otp === enteredOtp) {
    req.session.otpVerified = true;
    return res.status(200).json({ message: 'OTP verified successfully.' });
  }
  return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
};
