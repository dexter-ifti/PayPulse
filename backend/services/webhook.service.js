const crypto = require('crypto');
const { mongoose } = require('mongoose');
const { WebhookEvent } = require('../models/webhookEvent.model');
const { Transaction } = require('../models/transaction.model');
const {
    TRANSACTION_STATES,
    transitionTransactionState
} = require('./transactionState.service');

const WEBHOOK_PROVIDER = 'paypulse-simulated-provider';
const WEBHOOK_REPLAY_WINDOW_MS = 5 * 60 * 1000;

// Feature: webhook signature verification uses HMAC-SHA256 over timestamp and raw request body.
const verifyWebhookSignature = ({ rawBody, timestamp, signature }) => {
    const secret = process.env.WEBHOOK_SECRET;

    if (!secret && process.env.NODE_ENV === 'production') {
        return {
            ok: false,
            message: 'Webhook secret is not configured'
        };
    }

    if (!signature || !timestamp) {
        return {
            ok: false,
            message: 'Webhook signature and timestamp headers are required'
        };
    }

    const timestampMs = Number(timestamp);

    if (!Number.isFinite(timestampMs)) {
        return {
            ok: false,
            message: 'Invalid webhook timestamp'
        };
    }

    if (Math.abs(Date.now() - timestampMs) > WEBHOOK_REPLAY_WINDOW_MS) {
        return {
            ok: false,
            message: 'Webhook timestamp is outside the replay window'
        };
    }

    if (!secret) {
        return {
            ok: true,
            skipped: true
        };
    }

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${rawBody}`)
        .digest('hex');

    const receivedSignature = signature.startsWith('sha256=')
        ? signature.slice('sha256='.length)
        : signature;

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(receivedSignature);

    if (
        expectedBuffer.length !== receivedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
        return {
            ok: false,
            message: 'Invalid webhook signature'
        };
    }

    return { ok: true };
};

// Feature: webhook event IDs are required and bounded so provider retries can be de-duplicated.
const validateWebhookHeaders = (req) => {
    const eventId = req.get('X-PayPulse-Event-Id')?.trim();
    const timestamp = req.get('X-PayPulse-Timestamp')?.trim();
    const signature = req.get('X-PayPulse-Signature')?.trim();

    if (!eventId || eventId.length < 8 || eventId.length > 128) {
        return {
            ok: false,
            message: 'X-PayPulse-Event-Id must be 8-128 characters'
        };
    }

    return {
        ok: true,
        eventId,
        timestamp,
        signature
    };
};

// Feature: webhook payload hashing preserves evidence of the exact received event body.
const hashWebhookPayload = (rawBody) => {
    return crypto.createHash('sha256').update(rawBody).digest('hex');
};

// Feature: duplicate webhook events replay the stored result instead of re-processing side effects.
const createOrReplayWebhookEvent = async ({
    eventId,
    eventType,
    payload,
    payloadHash,
    signature,
    timestampHeader
}) => {
    try {
        const webhookEvent = {
            provider: WEBHOOK_PROVIDER,
            eventId,
            eventType,
            payloadHash,
            signature,
            timestampHeader,
            payload
        };

        if (payload.transactionId && mongoose.Types.ObjectId.isValid(payload.transactionId)) {
            webhookEvent.transactionId = payload.transactionId;
        }

        const event = await WebhookEvent.create(webhookEvent);

        return {
            isNew: true,
            event
        };
    } catch (error) {
        if (error.code !== 11000) {
            throw error;
        }

        const event = await WebhookEvent.findOne({
            provider: WEBHOOK_PROVIDER,
            eventId
        });

        return {
            isNew: false,
            event
        };
    }
};

const markWebhookEvent = async ({ eventId, status, lastError }) => {
    const update = {
        status
    };

    if (status === 'processing') {
        update.$inc = { attempts: 1 };
    }

    if (lastError) {
        update.lastError = lastError;
    }

    if (['processed', 'failed', 'ignored'].includes(status)) {
        update.processedAt = new Date();
    }

    return WebhookEvent.findByIdAndUpdate(eventId, update, { new: true });
};

const EVENT_STATE_MAP = Object.freeze({
    PAYMENT_SUCCESS: TRANSACTION_STATES.SUCCESS,
    PAYMENT_FAILED: TRANSACTION_STATES.FAILED,
    PAYMENT_REVERSED: TRANSACTION_STATES.REVERSED,
    REFUND_PROCESSED: TRANSACTION_STATES.REVERSED
});

// Feature: idempotent webhook processing applies provider state changes only when the transaction transition is valid.
const processWebhookEvent = async (webhookEvent) => {
    const session = await mongoose.startSession();

    try {
        await markWebhookEvent({
            eventId: webhookEvent._id,
            status: 'processing'
        });

        const targetState = EVENT_STATE_MAP[webhookEvent.eventType];

        if (!targetState) {
            return markWebhookEvent({
                eventId: webhookEvent._id,
                status: 'ignored',
                lastError: `Unsupported webhook event type: ${webhookEvent.eventType}`
            });
        }

        if (!webhookEvent.payload?.transactionId) {
            return markWebhookEvent({
                eventId: webhookEvent._id,
                status: 'failed',
                lastError: 'Webhook payload is missing transactionId'
            });
        }

        session.startTransaction();

        const transaction = await Transaction.findById(webhookEvent.payload.transactionId).session(session);

        if (!transaction) {
            await session.abortTransaction();
            return markWebhookEvent({
                eventId: webhookEvent._id,
                status: 'failed',
                lastError: 'Transaction not found for webhook event'
            });
        }

        if (transaction.status === targetState) {
            await session.commitTransaction();
            return markWebhookEvent({
                eventId: webhookEvent._id,
                status: 'processed'
            });
        }

        await transitionTransactionState({
            transaction,
            toState: targetState,
            reason: `Webhook ${webhookEvent.eventType} received from ${WEBHOOK_PROVIDER}`,
            session
        });

        await session.commitTransaction();

        return markWebhookEvent({
            eventId: webhookEvent._id,
            status: 'processed'
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        return markWebhookEvent({
            eventId: webhookEvent._id,
            status: 'failed',
            lastError: error.message
        });
    } finally {
        session.endSession();
    }
};

module.exports = {
    WEBHOOK_PROVIDER,
    verifyWebhookSignature,
    validateWebhookHeaders,
    hashWebhookPayload,
    createOrReplayWebhookEvent,
    processWebhookEvent
};
