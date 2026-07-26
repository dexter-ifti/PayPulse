const mongoose = require('mongoose');
const { TRANSACTION_STATES } = require('../services/transactionState.service');

const transactionSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['opening_balance', 'transfer'],
        default: 'transfer',
        index: true
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: Object.values(TRANSACTION_STATES),
        default: TRANSACTION_STATES.CREATED,
        index: true
    },
    idempotencyKey: {
        type: String,
        trim: true,
        index: true
    },
    statusHistory: [{
        from: {
            type: String,
            enum: Object.values(TRANSACTION_STATES)
        },
        to: {
            type: String,
            enum: Object.values(TRANSACTION_STATES),
            required: true
        },
        reason: {
            type: String,
            trim: true
        },
        changedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

transactionSchema.index({ fromUserId: 1, createdAt: -1 });
transactionSchema.index({ toUserId: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction };
