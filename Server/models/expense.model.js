const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Expense description is required'],
        trim: true,
        maxlength: [100, 'Description must be less than 100 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be greater than 0']
    },
    category: {
        type: String,
        enum: ['Food', 'Travel', 'Rent', 'Entertainment', 'Shopping', 'Utilities', 'Others'],
        default: 'Others'
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        share: {
            type: Number,
            required: true
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
