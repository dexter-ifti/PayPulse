const express = require('express');
const userRouter = require('./user');
const accountRouter = require('./account');
const webhookRouter = require('./webhook');
const reconciliationRouter = require('./reconciliation');

const router = express.Router();

router.use('/user', userRouter);
router.use('/account', accountRouter);
router.use('/webhooks', webhookRouter);
router.use('/reconciliation', reconciliationRouter);


module.exports = router;
