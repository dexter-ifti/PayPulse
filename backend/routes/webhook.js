const express = require('express');
const { webhookController } = require('../controllers');

const router = express.Router();

router.post('/payments', webhookController.handlePaymentProviderWebhook);

module.exports = router;
