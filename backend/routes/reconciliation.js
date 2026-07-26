const express = require('express');
const { reconciliationController } = require('../controllers');
const { authMiddleware } = require('../middlewares');

const router = express.Router();

router.post('/run', authMiddleware, reconciliationController.runReconciliationReport);
router.get('/reports', authMiddleware, reconciliationController.listReconciliationReports);
router.get('/reports/:reportId', authMiddleware, reconciliationController.getReconciliationReport);

module.exports = router;
