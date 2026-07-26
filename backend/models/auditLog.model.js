const mongoose = require('mongoose');

// Feature: append-only audit log for security, money movement, and operations events.
const auditLogSchema = mongoose.Schema({
    actorUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    actorType: {
        type: String,
        enum: ['user', 'system', 'provider', 'anonymous'],
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    resourceType: {
        type: String,
        trim: true,
        index: true
    },
    resourceId: {
        type: String,
        trim: true,
        index: true
    },
    outcome: {
        type: String,
        enum: ['success', 'failure', 'blocked'],
        required: true,
        index: true
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    requestId: {
        type: String,
        trim: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = { AuditLog };
