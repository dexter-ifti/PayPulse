import { useEffect, useState } from 'react';
import axios from 'axios';

function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/v1/account/transactions`,
                    {
                        withCredentials: true, // Send cookies with request
                    }
                );
                if (active) setTransactions(response.data.data.transactions);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchTransactions();
        return () => { active = false; };
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} min ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            });
        }
    };

    return (
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Transaction History
            </h2>

            {loading ? (
                <div className="space-y-3" aria-hidden="true">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[72px] rounded-xl bg-slate-700/30 border border-slate-600/30 motion-safe:animate-pulse" />
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-slate-300 text-lg">No transactions yet</p>
                    <p className="text-slate-400 text-sm mt-2">Money you send and receive will show up here.</p>
                </div>
            ) : (
                <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {transactions.map((transaction) => {
                        const received = transaction.type === 'received';
                        return (
                            <li
                                key={transaction._id}
                                className="bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/50 transition-colors duration-200"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div
                                            className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-full ${received ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                            aria-hidden="true"
                                        >
                                            {received ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-white font-medium truncate">
                                                {received ? 'Received from' : 'Sent to'}{' '}
                                                {transaction.counterparty.firstName} {transaction.counterparty.lastName}
                                            </p>
                                            <p className="text-slate-400 text-sm">{formatDate(transaction.timestamp)}</p>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className={`font-bold text-lg ${received ? 'text-green-400' : 'text-red-400'}`}>
                                            {received ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                        </p>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${transaction.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                        >
                                            {transaction.status}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default TransactionHistory;
