const express = require('express');
const { auditController } = require('../controllers');
const { authMiddleware, rateLimitPolicy } = require('../middlewares');

const router = express.Router();

router.get('/logs', authMiddleware, rateLimitPolicy('adminRead'), auditController.listAuditLogs);

module.exports = router;
