const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    amount : 
    {
        type: Number,
        required: true,
        min: 0
    },
    transactionType: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    description: {  
        type: String,
        default: ''
    },  
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);