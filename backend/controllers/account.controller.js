const { Account } = require('../models/account.model');
const { Transaction } = require('../models/transaction.model');
const { LedgerEntry } = require('../models/ledgerEntry.model');
const { createTransferLedgerEntries } = require('../services/ledger.service');
const {
    buildRequestHash,
    getValidatedIdempotencyKey,
    beginIdempotentRequest,
    completeIdempotentRequest,
    failIdempotentRequest
} = require('../services/idempotency.service');
const {
    TRANSACTION_STATES,
    transitionTransactionState
} = require('../services/transactionState.service');
const { writeAuditLog } = require('../services/audit.service');
const { mongoose } = require('mongoose');
const { z } = require('zod');

// Feature: transfer payload validation blocks negative, zero, and non-finite payment amounts.
const transferSchema = z.object({
    amount: z.coerce.number().finite().positive(),
    to: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'Invalid recipient id'
    })
});

const getBalance = async (req, res) => {
    try {
        const account = await Account.findOne({
            userId: req.user._id
        });

        res.json({
            success: true,
            data: {
                balance: account.balance
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const transfer = async (req, res) => {
    const session = await mongoose.startSession();
    let transactionStarted = false;
    let idempotencyRecord = null;

    try {
        const idempotencyKeyResult = getValidatedIdempotencyKey(req);

        if (!idempotencyKeyResult.ok) {
            return res.status(400).json({
                success: false,
                message: idempotencyKeyResult.error
            });
        }

        const parsed = transferSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid transfer data",
                errors: parsed.error.errors
            });
        }

        const { amount, to } = parsed.data;
        const endpoint = 'POST /api/v1/account/transfer';
        const requestHash = buildRequestHash({
            userId: req.user._id,
            endpoint,
            body: { amount, to }
        });

        // Feature: idempotency-key handling prevents duplicate transfers during client or network retries.
        const idempotencyRequest = await beginIdempotentRequest({
            key: idempotencyKeyResult.key,
            userId: req.user._id,
            endpoint,
            requestHash
        });

        idempotencyRecord = idempotencyRequest.record;

        if (!idempotencyRequest.isNew) {
            if (!idempotencyRecord || idempotencyRecord.requestHash !== requestHash) {
                await writeAuditLog({
                    req,
                    action: 'transfer.idempotency_conflict',
                    resourceType: 'IdempotencyKey',
                    resourceId: idempotencyRecord?._id,
                    outcome: 'blocked',
                    details: {
                        idempotencyKey: idempotencyKeyResult.key
                    }
                });

                return res.status(409).json({
                    success: false,
                    message: "Idempotency-Key was already used with a different transfer request"
                });
            }

            if (['completed', 'failed'].includes(idempotencyRecord.status)) {
                await writeAuditLog({
                    req,
                    action: 'transfer.idempotency_replay',
                    resourceType: 'IdempotencyKey',
                    resourceId: idempotencyRecord._id,
                    outcome: 'success',
                    details: {
                        idempotencyKey: idempotencyKeyResult.key,
                        replayedStatus: idempotencyRecord.status
                    }
                });

                return res
                    .status(idempotencyRecord.responseStatusCode)
                    .set('Idempotency-Replayed', 'true')
                    .json(idempotencyRecord.responseBody);
            }

            return res.status(409).json({
                success: false,
                message: "A transfer with this Idempotency-Key is already processing",
                data: {
                    lockedUntil: idempotencyRecord.lockedUntil
                }
            });
        }

        const sendAndCacheResponse = async (statusCode, body) => {
            await completeIdempotentRequest({
                recordId: idempotencyRecord._id,
                responseStatusCode: statusCode,
                responseBody: body
            });

            return res.status(statusCode).json(body);
        };

        session.startTransaction();
        transactionStarted = true;

        // Prevent self-transfer
        if (req.user._id.toString() === to.toString()) {
            await session.abortTransaction();
            transactionStarted = false;
            return sendAndCacheResponse(400, {
                success: false,
                message: "Cannot transfer money to yourself"
            });
        }

        const account = await Account.findOne({ userId: req.user._id }).session(session);

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            transactionStarted = false;
            return sendAndCacheResponse(400, {
                success: false,
                message: "Insufficient balance"
            });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);

        if (!toAccount) {
            await session.abortTransaction();
            transactionStarted = false;
            return sendAndCacheResponse(400, {
                success: false,
                message: "Invalid account"
            });
        }

        // Feature: transfers now move through an explicit transaction state machine.
        const [transaction] = await Transaction.create([{
            type: 'transfer',
            fromUserId: req.user._id,
            toUserId: to,
            amount: amount,
            status: TRANSACTION_STATES.CREATED,
            idempotencyKey: idempotencyKeyResult.key
        }], { session });

        await transitionTransactionState({
            transaction,
            toState: TRANSACTION_STATES.PROCESSING,
            reason: 'Transfer accepted for wallet debit and credit',
            session
        });

        // Feature: atomic balance mutation remains for fast reads while ledger entries preserve the audit trail.
        const updatedFromAccount = await Account.findOneAndUpdate(
            { userId: req.user._id, balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { new: true, session }
        );

        if (!updatedFromAccount) {
            await session.abortTransaction();
            transactionStarted = false;
            return sendAndCacheResponse(400, {
                success: false,
                message: "Insufficient balance"
            });
        }

        const updatedToAccount = await Account.findOneAndUpdate(
            { userId: to },
            { $inc: { balance: amount } },
            { new: true, session }
        );

        if (!updatedToAccount) {
            await session.abortTransaction();
            transactionStarted = false;
            return sendAndCacheResponse(400, {
                success: false,
                message: "Invalid account"
            });
        }

        await createTransferLedgerEntries({
            transactionId: transaction._id,
            fromAccount: updatedFromAccount,
            toAccount: updatedToAccount,
            amount,
            session
        });

        await transitionTransactionState({
            transaction,
            toState: TRANSACTION_STATES.SUCCESS,
            reason: 'Wallet debit, credit, and ledger posting completed',
            session
        });

        const responseBody = {
            success: true,
            message: "Transfer successful",
            data: {
                transactionId: transaction._id
            }
        };

        await completeIdempotentRequest({
            recordId: idempotencyRecord._id,
            responseStatusCode: 200,
            responseBody,
            transactionId: transaction._id,
            session
        });

        await writeAuditLog({
            req,
            action: 'transfer.completed',
            resourceType: 'Transaction',
            resourceId: transaction._id,
            outcome: 'success',
            details: {
                amount,
                fromUserId: req.user._id,
                toUserId: to,
                idempotencyKey: idempotencyKeyResult.key
            },
            session
        });

        await session.commitTransaction();
        transactionStarted = false;
        res.json(responseBody);
    } catch (error) {
        if (transactionStarted) {
            await session.abortTransaction();
            transactionStarted = false;
        }

        if (idempotencyRecord) {
            try {
                await failIdempotentRequest({
                    recordId: idempotencyRecord._id,
                    responseStatusCode: 500,
                    responseBody: {
                        success: false,
                        message: "Internal server error"
                    }
                });
            } catch (idempotencyError) {
                console.error("Error marking idempotency request as failed:", idempotencyError);
            }
        }

        console.error("Error processing transfer:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    } finally {
        session.endSession();
    }
};

const getTransactionHistory = async (req, res) => {
    try {
        const { Transaction } = require('../models/transaction.model');
        const { User } = require('../models/user.model');

        // Find all transactions where user is either sender or receiver
        const transactions = await Transaction.find({
            type: 'transfer',
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
                    statusHistory: transaction.statusHistory,
                    timestamp: transaction.createdAt,
                    type: transaction.fromUserId.toString() === req.user._id.toString() ? 'sent' : 'received',
                    counterparty: transaction.fromUserId.toString() === req.user._id.toString()
                        ? { firstName: toUser.firstName, lastName: toUser.lastName }
                        : { firstName: fromUser.firstName, lastName: fromUser.lastName }
                };
            })
        );

        res.json({
            success: true,
            data: {
                transactions: transactionsWithDetails
            }
        });
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Feature: expose immutable ledger rows so every account balance change can be audited.
const getLedgerHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const entries = await LedgerEntry.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalEntries = await LedgerEntry.countDocuments({ userId: req.user._id });

        res.json({
            success: true,
            data: {
                ledgerEntries: entries,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalEntries / limit),
                    totalEntries,
                    limit
                }
            }
        });
    } catch (error) {
        console.error("Error fetching ledger history:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    getBalance,
    transfer,
    getTransactionHistory,
    getLedgerHistory
};
