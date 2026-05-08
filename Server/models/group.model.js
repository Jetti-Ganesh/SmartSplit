const mongoose = require('mongoose');
const { create } = require('./user.model');
const { join, isAbsolute } = require('path');
const { type } = require('os');
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Group name is required'],
        trim: true,
        maxlength: [50, 'Group name must be less than 50 characters']
    },
    icon:
    {
        type: String,
        default: '🫂',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role:
        {
            type: String,
            enum: ['admin', 'member'],
            defaut: 'member',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    inviteCode: {
        type: String,
        unique: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt:
    {
        type: Date,
        default: Date.now,
    }
});
//genertae unique invite code
groupSchema.pre('save',function(next)
{
    if(!this.inviteCode)
    {
        this.inviteCode = Math.random().toString().toUpperCase();
    }
    next();
});
module.exports = mongoose.model('Group',groupSchema);