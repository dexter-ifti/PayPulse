const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares');
const { accountController } = require('../controllers');

// Account routes
router.get('/balance', authMiddleware, accountController.getBalance);
router.post('/transfer', authMiddleware, accountController.transfer);
router.get('/transactions', authMiddleware, accountController.getTransactionHistory);

module.exports = router;