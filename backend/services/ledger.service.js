const { LedgerEntry } = require('../models/ledgerEntry.model');

const SYSTEM_FUNDING_LEDGER_ACCOUNT = 'system:paypulse-funding';

// Feature: stable wallet ledger-account identifiers decouple ledger entries from mutable account fields.
const buildWalletLedgerAccount = (accountId) => {
    return `wallet:${accountId.toString()}`;
};

// Feature: double-entry validation rejects any money movement where debits and credits do not balance.
const assertBalancedLedgerEntries = (entries) => {
    const totals = entries.reduce((acc, entry) => {
        acc[entry.entryType] += entry.amount;
        return acc;
    }, { debit: 0, credit: 0 });

    if (totals.debit !== totals.credit) {
        throw new Error('Ledger entries are not balanced');
    }
};

// Feature: opening wallet balances are represented as a debit from system funding and credit to the user wallet.
const createOpeningBalanceLedgerEntries = async ({
    transactionId,
    account,
    amount,
    session
}) => {
    const entries = [
        {
            transactionId,
            ledgerAccount: SYSTEM_FUNDING_LEDGER_ACCOUNT,
            entryType: 'debit',
            movementType: 'opening_balance',
            amount,
            currency: 'INR',
            description: 'Initial PayPulse wallet funding',
            metadata: {
                fundedUserId: account.userId
            }
        },
        {
            transactionId,
            accountId: account._id,
            userId: account.userId,
            ledgerAccount: buildWalletLedgerAccount(account._id),
            entryType: 'credit',
            movementType: 'opening_balance',
            amount,
            currency: 'INR',
            balanceAfter: account.balance,
            description: 'Initial PayPulse wallet funding'
        }
    ];

    assertBalancedLedgerEntries(entries);
    return LedgerEntry.create(entries, { session });
};

// Feature: P2P transfers post a debit to the sender wallet and a matching credit to the receiver wallet.
const createTransferLedgerEntries = async ({
    transactionId,
    fromAccount,
    toAccount,
    amount,
    session
}) => {
    const entries = [
        {
            transactionId,
            accountId: fromAccount._id,
            userId: fromAccount.userId,
            ledgerAccount: buildWalletLedgerAccount(fromAccount._id),
            entryType: 'debit',
            movementType: 'transfer',
            amount,
            currency: 'INR',
            balanceAfter: fromAccount.balance,
            description: 'Peer-to-peer transfer debit',
            metadata: {
                counterpartyUserId: toAccount.userId
            }
        },
        {
            transactionId,
            accountId: toAccount._id,
            userId: toAccount.userId,
            ledgerAccount: buildWalletLedgerAccount(toAccount._id),
            entryType: 'credit',
            movementType: 'transfer',
            amount,
            currency: 'INR',
            balanceAfter: toAccount.balance,
            description: 'Peer-to-peer transfer credit',
            metadata: {
                counterpartyUserId: fromAccount.userId
            }
        }
    ];

    assertBalancedLedgerEntries(entries);
    return LedgerEntry.create(entries, { session });
};

module.exports = {
    buildWalletLedgerAccount,
    createOpeningBalanceLedgerEntries,
    createTransferLedgerEntries
};
