const express = require('express');
const userRouter = require('./user');
const accountRouter = require('./account');
const webhookRouter = require('./webhook');

const router = express.Router();

router.use('/user', userRouter);
router.use('/account', accountRouter);
router.use('/webhooks', webhookRouter);


module.exports = router;
