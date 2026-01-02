import React from 'react';

const Balance = ({ value }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6 hover:border-orange-500/50 transition-all duration-300">
      <div className="flex items-baseline">
        <div className="text-gray-400 text-lg">
          Your balance
        </div>
        <div className="ml-auto text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          ₹ {value || '0'}
        </div>
      </div>
    </div>
  );
};

export default Balance;
