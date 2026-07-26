const crypto = require('crypto');
const { IdempotencyKey } = require('../models/idempotencyKey.model');

const IDEMPOTENCY_KEY_TTL_MS = 24 * 60 * 60 * 1000;
const IDEMPOTENCY_LOCK_MS = 5 * 60 * 1000;

// Feature: canonical JSON hashing detects when the same idempotency key is reused with a different payload.
const stableStringify = (value) => {
    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }

    if (value && typeof value === 'object') {
        return `{${Object.keys(value).sort().map((key) => {
            return `${JSON.stringify(key)}:${stableStringify(value[key])}`;
        }).join(',')}}`;
    }

    return JSON.stringify(value);
};

// Feature: idempotency request fingerprints bind the key to the caller, endpoint, and normalized payment payload.
const buildRequestHash = ({ userId, endpoint, body }) => {
    return crypto
        .createHash('sha256')
        .update(stableStringify({
            userId: userId.toString(),
            endpoint,
            body
        }))
        .digest('hex');
};

// Feature: payment APIs require a bounded, printable Idempotency-Key header.
const getValidatedIdempotencyKey = (req) => {
    const key = req.get('Idempotency-Key')?.trim();

    if (!key) {
        return {
            ok: false,
            error: 'Idempotency-Key header is required'
        };
    }

    if (key.length < 8 || key.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(key)) {
        return {
            ok: false,
            error: 'Idempotency-Key must be 8-128 characters and contain only letters, numbers, dots, underscores, colons, or hyphens'
        };
    }

    return { ok: true, key };
};

// Feature: first writer owns the idempotency key; concurrent duplicate requests are detected by the unique index.
const beginIdempotentRequest = async ({
    key,
    userId,
    endpoint,
    requestHash
}) => {
    const now = new Date();

    try {
        const record = await IdempotencyKey.create({
            key,
            userId,
            endpoint,
            requestHash,
            status: 'processing',
            lockedUntil: new Date(now.getTime() + IDEMPOTENCY_LOCK_MS),
            expiresAt: new Date(now.getTime() + IDEMPOTENCY_KEY_TTL_MS)
        });

        return {
            isNew: true,
            record
        };
    } catch (error) {
        if (error.code !== 11000) {
            throw error;
        }

        const record = await IdempotencyKey.findOne({ key, userId });
        return {
            isNew: false,
            record
        };
    }
};

// Feature: successful or deterministic failed responses are stored so retries replay the same API result.
const completeIdempotentRequest = async ({
    recordId,
    responseStatusCode,
    responseBody,
    transactionId,
    session
}) => {
    const update = {
        status: 'completed',
        responseStatusCode,
        responseBody,
        completedAt: new Date()
    };

    if (transactionId) {
        update.transactionId = transactionId;
    }

    return IdempotencyKey.findByIdAndUpdate(recordId, update, {
        new: true,
        session
    });
};

// Feature: unexpected failures are recorded separately from completed payment outcomes.
const failIdempotentRequest = async ({
    recordId,
    responseStatusCode,
    responseBody
}) => {
    return IdempotencyKey.findByIdAndUpdate(recordId, {
        status: 'failed',
        responseStatusCode,
        responseBody,
        completedAt: new Date()
    }, { new: true });
};

module.exports = {
    buildRequestHash,
    getValidatedIdempotencyKey,
    beginIdempotentRequest,
    completeIdempotentRequest,
    failIdempotentRequest
};
