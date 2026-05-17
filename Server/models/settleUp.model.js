const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['upi', 'cash', 'bank_transfer', 'other'],
    default: 'upi'
  },
  upiTransactionId: String,
  notes: String,
  settledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'disputed'],
    default: 'completed'
  }
});

module.exports = mongoose.model('Settlement', settlementSchema);