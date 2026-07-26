const mongoose = require('mongoose');

// Feature: durable webhook event log for replay protection and auditability.
const webhookEventSchema = mongoose.Schema({
    provider: {
        type: String,
        required: true,
        trim: true,
        default: 'paypulse-simulated-provider'
    },
    eventId: {
        type: String,
        required: true,
        trim: true
    },
    eventType: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    payloadHash: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true
    },
    timestampHeader: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['received', 'processing', 'processed', 'failed', 'ignored'],
        default: 'received',
        index: true
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        index: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    lastError: {
        type: String,
        trim: true
    },
    processedAt: {
        type: Date
    }
}, {
    timestamps: true
});

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
webhookEventSchema.index({ status: 1, createdAt: -1 });

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);

module.exports = { WebhookEvent };
