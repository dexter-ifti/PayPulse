const TRANSACTION_STATES = Object.freeze({
    CREATED: 'CREATED',
    PROCESSING: 'PROCESSING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    REVERSED: 'REVERSED',
    EXPIRED: 'EXPIRED'
});

const ALLOWED_TRANSACTION_TRANSITIONS = Object.freeze({
    [TRANSACTION_STATES.CREATED]: [
        TRANSACTION_STATES.PROCESSING,
        TRANSACTION_STATES.FAILED,
        TRANSACTION_STATES.EXPIRED
    ],
    [TRANSACTION_STATES.PROCESSING]: [
        TRANSACTION_STATES.SUCCESS,
        TRANSACTION_STATES.FAILED
    ],
    [TRANSACTION_STATES.SUCCESS]: [
        TRANSACTION_STATES.REVERSED
    ],
    [TRANSACTION_STATES.FAILED]: [],
    [TRANSACTION_STATES.REVERSED]: [],
    [TRANSACTION_STATES.EXPIRED]: []
});

// Feature: transaction state machine prevents invalid payment lifecycle jumps.
const assertValidTransactionTransition = (fromState, toState) => {
    const allowedStates = ALLOWED_TRANSACTION_TRANSITIONS[fromState] || [];

    if (!allowedStates.includes(toState)) {
        throw new Error(`Invalid transaction transition from ${fromState} to ${toState}`);
    }
};

// Feature: all transaction state changes append an audit-friendly status history entry.
const transitionTransactionState = async ({
    transaction,
    toState,
    reason,
    session
}) => {
    const fromState = transaction.status;

    if (fromState === toState) {
        return transaction;
    }

    assertValidTransactionTransition(fromState, toState);

    transaction.status = toState;
    transaction.statusHistory.push({
        from: fromState,
        to: toState,
        reason,
        changedAt: new Date()
    });

    return transaction.save({ session });
};

module.exports = {
    TRANSACTION_STATES,
    ALLOWED_TRANSACTION_TRANSITIONS,
    assertValidTransactionTransition,
    transitionTransactionState
};
