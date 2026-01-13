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

    // Prevent self-transfer
    if (req.user._id.toString() === to.toString()) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Cannot transfer money to yourself"
        });
    }

    const account = await Account.findOne({ userId: req.user._id }).session(session);

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

    // Perform the transfer
    await Account.updateOne({ userId: req.user._id }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Record the transaction
    const { Transaction } = require('../models/transaction.model');
    await Transaction.create([{
        fromUserId: req.user._id,
        toUserId: to,
        amount: amount,
        status: 'success'
    }], { session });

    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
};

const getTransactionHistory = async (req, res) => {
    try {
        const { Transaction } = require('../models/transaction.model');
        const { User } = require('../models/user.model');

        // Find all transactions where user is either sender or receiver
        const transactions = await Transaction.find({
            $or: [
                { fromUserId: req.user._id },
                { toUserId: req.user._id }
            ]
        }).sort({ createdAt: -1 });

        // Populate user details
        const transactionsWithDetails = await Promise.all(
            transactions.map(async (transaction) => {
                const fromUser = await User.findById(transaction.fromUserId).select('firstName lastName');
                const toUser = await User.findById(transaction.toUserId).select('firstName lastName');

                return {
                    _id: transaction._id,
                    amount: transaction.amount,
                    status: transaction.status,
                    timestamp: transaction.createdAt,
                    type: transaction.fromUserId.toString() === req.user._id.toString() ? 'sent' : 'received',
                    counterparty: transaction.fromUserId.toString() === req.user._id.toString()
                        ? { firstName: toUser.firstName, lastName: toUser.lastName }
                        : { firstName: fromUser.firstName, lastName: fromUser.lastName }
                };
            })
        );

        res.json({
            transactions: transactionsWithDetails
        });
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getBalance,
    transfer,
    getTransactionHistory
};
