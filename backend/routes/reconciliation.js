const express = require('express');
const { reconciliationController } = require('../controllers');
const { authMiddleware, rateLimitPolicy } = require('../middlewares');

const router = express.Router();

router.post('/run', authMiddleware, rateLimitPolicy('adminWrite'), reconciliationController.runReconciliationReport);
router.get('/reports', authMiddleware, rateLimitPolicy('adminRead'), reconciliationController.listReconciliationReports);
router.get('/reports/:reportId', authMiddleware, rateLimitPolicy('adminRead'), reconciliationController.getReconciliationReport);

module.exports = router;
