const {
    verifyWebhookSignature,
    validateWebhookHeaders,
    hashWebhookPayload,
    createOrReplayWebhookEvent,
    processWebhookEvent
} = require('../services/webhook.service');
const { getDueWebhookRetries } = require('../services/retry.service');
const { writeAuditLog } = require('../services/audit.service');
const { WebhookEvent } = require('../models/webhookEvent.model');
const { DeadLetterEvent } = require('../models/deadLetterEvent.model');

// Feature: signed payment-provider webhook endpoint with replay protection and idempotent event handling.
const handlePaymentProviderWebhook = async (req, res) => {
    try {
        const headerValidation = validateWebhookHeaders(req);

        if (!headerValidation.ok) {
            return res.status(400).json({
                success: false,
                message: headerValidation.message
            });
        }

        const rawBody = req.rawBody || JSON.stringify(req.body);
        const signatureValidation = verifyWebhookSignature({
            rawBody,
            timestamp: headerValidation.timestamp,
            signature: headerValidation.signature
        });

        if (!signatureValidation.ok) {
            return res.status(401).json({
                success: false,
                message: signatureValidation.message
            });
        }

        const { type, data } = req.body || {};

        if (!type || !data || typeof data !== 'object') {
            return res.status(400).json({
                success: false,
                message: "Webhook payload must include type and data"
            });
        }

        const webhookRequest = await createOrReplayWebhookEvent({
            eventId: headerValidation.eventId,
            eventType: type,
            payload: data,
            payloadHash: hashWebhookPayload(rawBody),
            signature: headerValidation.signature,
            timestampHeader: new Date(Number(headerValidation.timestamp))
        });

        if (!webhookRequest.isNew) {
            if (webhookRequest.event.payloadHash !== hashWebhookPayload(rawBody)) {
                await writeAuditLog({
                    req,
                    actorType: 'provider',
                    action: 'webhook.payload_conflict',
                    resourceType: 'WebhookEvent',
                    resourceId: webhookRequest.event._id,
                    outcome: 'blocked',
                    details: {
                        eventId: headerValidation.eventId,
                        eventType: type
                    }
                });

                return res.status(409).json({
                    success: false,
                    message: "Webhook event ID was already used with a different payload"
                });
            }

            await writeAuditLog({
                req,
                actorType: 'provider',
                action: 'webhook.replayed',
                resourceType: 'WebhookEvent',
                resourceId: webhookRequest.event._id,
                outcome: 'success',
                details: {
                    eventId: webhookRequest.event.eventId,
                    status: webhookRequest.event.status
                }
            });

            return res
                .status(200)
                .set('Webhook-Replayed', 'true')
                .json({
                    success: true,
                    message: "Webhook event already received",
                    data: {
                        eventId: webhookRequest.event.eventId,
                        status: webhookRequest.event.status
                    }
                });
        }

        const processedEvent = await processWebhookEvent(webhookRequest.event);

        await writeAuditLog({
            req,
            actorType: 'provider',
            action: 'webhook.received',
            resourceType: 'WebhookEvent',
            resourceId: processedEvent._id,
            outcome: processedEvent.status === 'processed' ? 'success' : 'failure',
            details: {
                eventId: processedEvent.eventId,
                eventType: processedEvent.eventType,
                status: processedEvent.status,
                attempts: processedEvent.attempts
            }
        });

        return res.status(200).json({
            success: true,
            message: "Webhook event received",
            data: {
                eventId: processedEvent.eventId,
                status: processedEvent.status,
                attempts: processedEvent.attempts
            }
        });
    } catch (error) {
        console.error("Error handling payment webhook:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Feature: inspect persisted webhook events for debugging provider callbacks and retry state.
const listWebhookEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const query = status ? { status } : {};

        const [events, totalEvents] = await Promise.all([
            WebhookEvent.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            WebhookEvent.countDocuments(query)
        ]);

        return res.json({
            success: true,
            data: {
                events,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalEvents / limit),
                    totalEvents,
                    limit
                }
            }
        });
    } catch (error) {
        console.error("Error listing webhook events:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Feature: manually process due webhook retries in bounded batches for local demos and worker-style execution.
const processDueWebhookRetries = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.body?.limit || req.query.limit) || 25, 100);
        const dueEvents = await getDueWebhookRetries({ limit });
        const results = [];

        for (const event of dueEvents) {
            const processedEvent = await processWebhookEvent(event);
            results.push({
                eventId: processedEvent.eventId,
                status: processedEvent.status,
                attempts: processedEvent.attempts,
                nextRetryAt: processedEvent.nextRetryAt,
                lastError: processedEvent.lastError
            });
        }

        await writeAuditLog({
            req,
            action: 'webhook.retry_batch_processed',
            resourceType: 'WebhookEvent',
            outcome: 'success',
            details: {
                processedCount: results.length,
                results
            }
        });

        return res.json({
            success: true,
            message: "Due webhook retries processed",
            data: {
                processedCount: results.length,
                results
            }
        });
    } catch (error) {
        console.error("Error processing webhook retries:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Feature: inspect dead-lettered webhook events that need manual operator resolution.
const listDeadLetterEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const [events, totalEvents] = await Promise.all([
            DeadLetterEvent.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            DeadLetterEvent.countDocuments()
        ]);

        return res.json({
            success: true,
            data: {
                events,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalEvents / limit),
                    totalEvents,
                    limit
                }
            }
        });
    } catch (error) {
        console.error("Error listing dead-letter events:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    handlePaymentProviderWebhook,
    listWebhookEvents,
    processDueWebhookRetries,
    listDeadLetterEvents
};
