const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    email:           { type: String, lowercase: true, trim: true },
    phone:           { type: String, trim: true },
    password:        { type: String, required: true },
    avatar:          { type: String, default: '' },
    defaultUpi:      { type: String, default: '' },
    upiList:         { type: [String], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    signupMethod:    { type: String, enum: ['email', 'phone', 'google'], default: 'email' },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod:  { type: String, enum: ['email', 'phone'], default: 'email' },
    notifications: [
      {
        type: {
          type: String,
          enum: ['success', 'error', 'info', 'group', 'system'],
          default: 'info'
        },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Sparse unique indexes — null values are ignored, but non-null must be unique
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Pre-validate hook to clean up empty/null values so sparse unique index works
userSchema.pre('validate', function () {
  if (this.email === null || this.email === '') {
    this.email = undefined;
  }
  if (this.phone === null || this.phone === '') {
    this.phone = undefined;
  }
});

// At least one of email or phone must exist
userSchema.pre('save', function () {
  if (!this.email && !this.phone) {
    throw new Error('User must have either email or phone.');
  }
});

module.exports = mongoose.model('User', userSchema);