const { Account } = require('../models/account.model');
const { mongoose } = require('mongoose');

const getBalance = async (req, res) => {
    try {
        const account = await Account.findOne({
            userId: req.user._id
        });
    
        res.json({
            balance: account.balance
        });    
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const transfer = async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    const { amount, to } = req.body;

    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }

    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
};

module.exports = {
    getBalance,
    transfer
};
