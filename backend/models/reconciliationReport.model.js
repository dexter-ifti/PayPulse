const mongoose = require('mongoose');

// Feature: reconciliation reports persist detected money-system mismatches for later audit.
const reconciliationReportSchema = mongoose.Schema({
    status: {
        type: String,
        enum: ['completed', 'failed'],
        required: true,
        index: true
    },
    startedAt: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date,
        required: true
    },
    summary: {
        accountsChecked: {
            type: Number,
            default: 0
        },
        transactionsChecked: {
            type: Number,
            default: 0
        },
        webhookEventsChecked: {
            type: Number,
            default: 0
        },
        discrepanciesFound: {
            type: Number,
            default: 0
        }
    },
    discrepancies: [{
        type: {
            type: String,
            required: true,
            trim: true
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            required: true
        },
        entityType: {
            type: String,
            required: true,
            trim: true
        },
        entityId: {
            type: String,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        expected: {
            type: mongoose.Schema.Types.Mixed
        },
        actual: {
            type: mongoose.Schema.Types.Mixed
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    }],
    errorMessage: {
        type: String,
        trim: true
    },
    triggeredByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

reconciliationReportSchema.index({ createdAt: -1 });

const ReconciliationReport = mongoose.model('ReconciliationReport', reconciliationReportSchema);

module.exports = { ReconciliationReport };
