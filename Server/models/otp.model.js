const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // automatic cleanup after 5 minutes (300 seconds)
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('Otp', otpSchema);
