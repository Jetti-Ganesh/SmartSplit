const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    email:           { type: String, default: null, lowercase: true, trim: true },
    phone:           { type: String, default: null, trim: true },
    password:        { type: String, required: true },
    avatar:          { type: String, default: '' },
    defaultUpi:      { type: String, default: '' },
    upiList:         { type: [String], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    signupMethod:    { type: String, enum: ['email', 'phone', 'google'], default: 'email' },
  },
  { timestamps: true }
);

// Sparse unique indexes — null values are ignored, but non-null must be unique
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

// At least one of email or phone must exist
userSchema.pre('save', function () {
  if (!this.email && !this.phone) {
    throw new Error('User must have either email or phone.');
  }
});

module.exports = mongoose.model('User', userSchema);