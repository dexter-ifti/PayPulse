const express = require('express');
const { webhookController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.post('/payments', webhookController.handlePaymentProviderWebhook);
router.get('/events', authMiddleware, webhookController.listWebhookEvents);
router.post('/retries/process', authMiddleware, webhookController.processDueWebhookRetries);
router.get('/dead-letter', authMiddleware, webhookController.listDeadLetterEvents);

module.exports = router;
