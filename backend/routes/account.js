const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware');
const { accountController } = require('../controllers');

// Account routes
router.get('/balance', authMiddleware, accountController.getBalance);
router.post('/transfer', authMiddleware, accountController.transfer);

module.exports = router;