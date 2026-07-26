const { Account } = require('../models/account.model');
const { LedgerEntry } = require('../models/ledgerEntry.model');
const { Transaction } = require('../models/transaction.model');
const { WebhookEvent } = require('../models/webhookEvent.model');
const { ReconciliationReport } = require('../models/reconciliationReport.model');
const { TRANSACTION_STATES } = require('./transactionState.service');

const PROVIDER_EVENT_EXPECTED_STATE = Object.freeze({
    PAYMENT_SUCCESS: TRANSACTION_STATES.SUCCESS,
    PAYMENT_FAILED: TRANSACTION_STATES.FAILED,
    PAYMENT_REVERSED: TRANSACTION_STATES.REVERSED,
    REFUND_PROCESSED: TRANSACTION_STATES.REVERSED
});

// Feature: compare cached wallet balances against balances derived from immutable ledger rows.
const findAccountLedgerDiscrepancies = async () => {
    const accounts = await Account.find();
    const discrepancies = [];

    for (const account of accounts) {
        const ledgerEntries = await LedgerEntry.find({ accountId: account._id });
        const derivedBalance = ledgerEntries.reduce((balance, entry) => {
            return entry.entryType === 'credit'
                ? balance + entry.amount
                : balance - entry.amount;
        }, 0);

        if (derivedBalance !== account.balance) {
            discrepancies.push({
                type: 'ACCOUNT_LEDGER_BALANCE_MISMATCH',
                severity: 'critical',
                entityType: 'Account',
                entityId: account._id.toString(),
                message: 'Cached account balance does not match ledger-derived balance',
                expected: {
                    balanceFromLedger: derivedBalance
                },
                actual: {
                    cachedBalance: account.balance
                },
                metadata: {
                    userId: account.userId,
                    ledgerEntryCount: ledgerEntries.length
                }
            });
        }
    }

    return {
        accountsChecked: accounts.length,
        discrepancies
    };
};

// Feature: verify completed money transactions have balanced debit and credit ledger entries.
const findTransactionLedgerDiscrepancies = async () => {
    const transactions = await Transaction.find({
        status: { $in: [TRANSACTION_STATES.SUCCESS, 'success'] }
    });
    const discrepancies = [];

    for (const transaction of transactions) {
        const ledgerEntries = await LedgerEntry.find({ transactionId: transaction._id });
        const debitTotal = ledgerEntries
            .filter((entry) => entry.entryType === 'debit')
            .reduce((total, entry) => total + entry.amount, 0);
        const creditTotal = ledgerEntries
            .filter((entry) => entry.entryType === 'credit')
            .reduce((total, entry) => total + entry.amount, 0);

        if (ledgerEntries.length === 0) {
            discrepancies.push({
                type: 'TRANSACTION_MISSING_LEDGER_ENTRIES',
                severity: 'critical',
                entityType: 'Transaction',
                entityId: transaction._id.toString(),
                message: 'Successful transaction has no ledger entries',
                expected: {
                    minimumLedgerEntries: 2
                },
                actual: {
                    ledgerEntryCount: 0
                }
            });
            continue;
        }

        if (debitTotal !== creditTotal) {
            discrepancies.push({
                type: 'TRANSACTION_LEDGER_NOT_BALANCED',
                severity: 'critical',
                entityType: 'Transaction',
                entityId: transaction._id.toString(),
                message: 'Transaction ledger debits and credits do not balance',
                expected: {
                    debitTotal
                },
                actual: {
                    creditTotal
                },
                metadata: {
                    ledgerEntryCount: ledgerEntries.length
                }
            });
        }

        if (debitTotal !== transaction.amount || creditTotal !== transaction.amount) {
            discrepancies.push({
                type: 'TRANSACTION_AMOUNT_LEDGER_MISMATCH',
                severity: 'high',
                entityType: 'Transaction',
                entityId: transaction._id.toString(),
                message: 'Transaction amount does not match ledger debit and credit totals',
                expected: {
                    transactionAmount: transaction.amount
                },
                actual: {
                    debitTotal,
                    creditTotal
                }
            });
        }
    }

    return {
        transactionsChecked: transactions.length,
        discrepancies
    };
};

// Feature: reconcile processed provider webhook events against internal transaction states.
const findProviderWebhookDiscrepancies = async () => {
    const webhookEvents = await WebhookEvent.find({
        status: 'processed',
        eventType: { $in: Object.keys(PROVIDER_EVENT_EXPECTED_STATE) }
    });
    const discrepancies = [];

    for (const event of webhookEvents) {
        const expectedState = PROVIDER_EVENT_EXPECTED_STATE[event.eventType];

        if (!event.transactionId) {
            discrepancies.push({
                type: 'PROVIDER_EVENT_MISSING_TRANSACTION_REFERENCE',
                severity: 'high',
                entityType: 'WebhookEvent',
                entityId: event._id.toString(),
                message: 'Processed provider webhook does not have a transaction reference',
                expected: {
                    transactionId: 'present'
                },
                actual: {
                    transactionId: null
                },
                metadata: {
                    providerEventId: event.eventId,
                    eventType: event.eventType
                }
            });
            continue;
        }

        const transaction = await Transaction.findById(event.transactionId);

        if (!transaction) {
            discrepancies.push({
                type: 'PROVIDER_EVENT_TRANSACTION_NOT_FOUND',
                severity: 'critical',
                entityType: 'WebhookEvent',
                entityId: event._id.toString(),
                message: 'Processed provider webhook points to a missing transaction',
                expected: {
                    transactionId: event.transactionId
                },
                actual: {
                    transactionFound: false
                },
                metadata: {
                    providerEventId: event.eventId,
                    eventType: event.eventType
                }
            });
            continue;
        }

        if (transaction.status !== expectedState) {
            discrepancies.push({
                type: 'PROVIDER_EVENT_TRANSACTION_STATE_MISMATCH',
                severity: 'high',
                entityType: 'Transaction',
                entityId: transaction._id.toString(),
                message: 'Internal transaction state does not match processed provider event',
                expected: {
                    transactionStatus: expectedState
                },
                actual: {
                    transactionStatus: transaction.status
                },
                metadata: {
                    providerEventId: event.eventId,
                    eventType: event.eventType
                }
            });
        }
    }

    return {
        webhookEventsChecked: webhookEvents.length,
        discrepancies
    };
};

// Feature: reconciliation report generation combines account, ledger, transaction, and provider-event checks.
const runReconciliation = async ({ triggeredByUserId } = {}) => {
    const startedAt = new Date();

    try {
        const [
            accountCheck,
            transactionCheck,
            providerCheck
        ] = await Promise.all([
            findAccountLedgerDiscrepancies(),
            findTransactionLedgerDiscrepancies(),
            findProviderWebhookDiscrepancies()
        ]);

        const discrepancies = [
            ...accountCheck.discrepancies,
            ...transactionCheck.discrepancies,
            ...providerCheck.discrepancies
        ];

        return ReconciliationReport.create({
            status: 'completed',
            startedAt,
            completedAt: new Date(),
            summary: {
                accountsChecked: accountCheck.accountsChecked,
                transactionsChecked: transactionCheck.transactionsChecked,
                webhookEventsChecked: providerCheck.webhookEventsChecked,
                discrepanciesFound: discrepancies.length
            },
            discrepancies,
            triggeredByUserId
        });
    } catch (error) {
        return ReconciliationReport.create({
            status: 'failed',
            startedAt,
            completedAt: new Date(),
            summary: {
                discrepanciesFound: 0
            },
            discrepancies: [],
            errorMessage: error.message,
            triggeredByUserId
        });
    }
};

module.exports = {
    findAccountLedgerDiscrepancies,
    findTransactionLedgerDiscrepancies,
    findProviderWebhookDiscrepancies,
    runReconciliation
};
