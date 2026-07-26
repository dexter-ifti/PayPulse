const {
    verifyWebhookSignature,
    validateWebhookHeaders,
    hashWebhookPayload,
    createOrReplayWebhookEvent,
    processWebhookEvent
} = require('../services/webhook.service');

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
                return res.status(409).json({
                    success: false,
                    message: "Webhook event ID was already used with a different payload"
                });
            }

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

module.exports = {
    handlePaymentProviderWebhook
};
