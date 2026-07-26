const mongoose = require('mongoose');

// Feature: immutable double-entry ledger rows for every wallet money movement.
const ledgerEntrySchema = mongoose.Schema({
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
        index: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    ledgerAccount: {
        type: String,
        required: true,
        index: true
    },
    entryType: {
        type: String,
        enum: ['debit', 'credit'],
        required: true
    },
    movementType: {
        type: String,
        enum: ['opening_balance', 'transfer'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR',
        uppercase: true,
        trim: true
    },
    balanceAfter: {
        type: Number
    },
    description: {
        type: String,
        trim: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

ledgerEntrySchema.index({ transactionId: 1, entryType: 1, ledgerAccount: 1 });
ledgerEntrySchema.index({ userId: 1, createdAt: -1 });

const LedgerEntry = mongoose.model('LedgerEntry', ledgerEntrySchema);

module.exports = { LedgerEntry };
