const mongoose = require('mongoose');

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
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
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
groupSchema.pre('save', function () {

    if (!this.inviteCode) {

        this.inviteCode = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
    }

});
module.exports = mongoose.model('Group',groupSchema);