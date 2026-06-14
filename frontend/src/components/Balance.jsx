import React from 'react';

const Balance = ({ value }) => {
  const loading = value === null || value === undefined;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6">
      <div className="flex items-baseline gap-4">
        <p className="text-gray-300 text-lg">
          Your balance
        </p>
        {loading ? (
          <div className="ml-auto h-8 w-36 rounded-lg bg-slate-700/70 motion-safe:animate-pulse" aria-hidden="true" />
        ) : (
          <div className="ml-auto text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            ₹ {value}
          </div>
        )}
      </div>
    </div>
  );
};

export default Balance;
