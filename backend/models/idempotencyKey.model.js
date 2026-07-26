const mongoose = require('mongoose');

// Feature: persisted idempotency records make retrying payment requests safe.
const idempotencyKeySchema = mongoose.Schema({
    key: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    endpoint: {
        type: String,
        required: true,
        trim: true
    },
    requestHash: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing',
        index: true
    },
    responseStatusCode: {
        type: Number
    },
    responseBody: {
        type: mongoose.Schema.Types.Mixed
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    lockedUntil: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

idempotencyKeySchema.index({ userId: 1, key: 1 }, { unique: true });
idempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const IdempotencyKey = mongoose.model('IdempotencyKey', idempotencyKeySchema);

module.exports = { IdempotencyKey };
