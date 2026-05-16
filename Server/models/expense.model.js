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
expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate split details match amount
expenseSchema.pre('save', function(next) {
  const totalSplit = this.splitDetails.reduce((sum, split) => sum + split.amount, 0);
  
  if (Math.abs(totalSplit - this.amount) > 0.01) {
    return next(new Error('Split amounts must equal total amount'));
  }
  
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);