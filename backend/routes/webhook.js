const express = require('express');
const { webhookController } = require('../controllers');
const { authMiddleware, rateLimitPolicy } = require('../middlewares');

const router = express.Router();

router.post('/payments', rateLimitPolicy('webhook'), webhookController.handlePaymentProviderWebhook);
router.get('/events', authMiddleware, rateLimitPolicy('adminRead'), webhookController.listWebhookEvents);
router.post('/retries/process', authMiddleware, rateLimitPolicy('adminWrite'), webhookController.processDueWebhookRetries);
router.get('/dead-letter', authMiddleware, rateLimitPolicy('adminRead'), webhookController.listDeadLetterEvents);

module.exports = router;
