const { WebhookEvent } = require('../models/webhookEvent.model');
const { DeadLetterEvent } = require('../models/deadLetterEvent.model');

const WEBHOOK_MAX_RETRY_ATTEMPTS = 5;
const WEBHOOK_RETRY_BACKOFF_MS = [
    1000,
    5000,
    30000,
    5 * 60 * 1000,
    15 * 60 * 1000
];

// Feature: exponential retry scheduling spaces webhook retries by attempt count.
const getWebhookRetryDelayMs = (attempts) => {
    const index = Math.min(Math.max(attempts - 1, 0), WEBHOOK_RETRY_BACKOFF_MS.length - 1);
    return WEBHOOK_RETRY_BACKOFF_MS[index];
};

// Feature: failed webhook events are either scheduled for retry or moved to dead-letter after max attempts.
const scheduleWebhookRetryOrDeadLetter = async ({ webhookEvent, reason }) => {
    if (webhookEvent.attempts >= WEBHOOK_MAX_RETRY_ATTEMPTS) {
        await DeadLetterEvent.findOneAndUpdate(
            {
                sourceType: 'webhook_event',
                sourceId: webhookEvent._id
            },
            {
                sourceType: 'webhook_event',
                sourceId: webhookEvent._id,
                provider: webhookEvent.provider,
                eventId: webhookEvent.eventId,
                eventType: webhookEvent.eventType,
                attempts: webhookEvent.attempts,
                reason,
                payload: webhookEvent.payload
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        return WebhookEvent.findByIdAndUpdate(webhookEvent._id, {
            status: 'dead_lettered',
            lastError: reason,
            deadLetteredAt: new Date()
        }, { new: true });
    }

    const nextRetryAt = new Date(Date.now() + getWebhookRetryDelayMs(webhookEvent.attempts));

    return WebhookEvent.findByIdAndUpdate(webhookEvent._id, {
        status: 'retry_scheduled',
        lastError: reason,
        nextRetryAt
    }, { new: true });
};

// Feature: due retry lookup gives workers a bounded batch of webhook events ready to process.
const getDueWebhookRetries = async ({ limit = 25 } = {}) => {
    return WebhookEvent.find({
        status: 'retry_scheduled',
        nextRetryAt: { $lte: new Date() }
    })
        .sort({ nextRetryAt: 1 })
        .limit(Math.min(limit, 100));
};

module.exports = {
    WEBHOOK_MAX_RETRY_ATTEMPTS,
    WEBHOOK_RETRY_BACKOFF_MS,
    getWebhookRetryDelayMs,
    scheduleWebhookRetryOrDeadLetter,
    getDueWebhookRetries
};
