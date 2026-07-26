const mongoose = require('mongoose');

// Feature: dead-letter events preserve permanently failed async work for operator review.
const deadLetterEventSchema = mongoose.Schema({
    sourceType: {
        type: String,
        enum: ['webhook_event'],
        required: true,
        index: true
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    provider: {
        type: String,
        trim: true
    },
    eventId: {
        type: String,
        trim: true,
        index: true
    },
    eventType: {
        type: String,
        trim: true,
        index: true
    },
    attempts: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    resolvedAt: {
        type: Date
    },
    resolutionNote: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

deadLetterEventSchema.index({ sourceType: 1, sourceId: 1 }, { unique: true });
deadLetterEventSchema.index({ createdAt: -1 });

const DeadLetterEvent = mongoose.model('DeadLetterEvent', deadLetterEventSchema);

module.exports = { DeadLetterEvent };
