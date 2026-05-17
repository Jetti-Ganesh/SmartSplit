const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  category: {
    type: String,
    enum: ['Food', 'Rent', 'Travel', 'Entertainment', 'Shopping',
      'Utilities', 'Health', 'Other'],
    default: 'Other'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'percent', 'shares'],
    default: 'equal'
  },
  splitDetails: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: Number, // For percent split
    shares: Number      // For shares split
  }],
  date: {
    type: Date,
    default: Date.now
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
expenseSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// Validate split details match amount
expenseSchema.pre('save', function () {
  const totalSplit = this.splitDetails.reduce((sum, split) => sum + split.amount, 0);

  // Use a tolerance of 0.1 (10 paise) for floating-point rounding errors
  // This accounts for IEEE 754 floating-point precision issues
  const difference = Math.abs(totalSplit - this.amount);

  if (difference > 0.1) {
    const error = new Error(
      `Split amounts (₹${totalSplit.toFixed(2)}) must equal total amount (₹${this.amount.toFixed(2)}). Difference: ₹${difference.toFixed(2)}`
    );
    return next(error);
  }
});

module.exports = mongoose.model('Expense', expenseSchema);