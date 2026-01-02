import React from 'react';

const Appbar = ({username = 'Dexter'}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 h-16 flex justify-between items-center px-6 sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="rounded-xl h-10 w-10 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
          <div className="text-white font-bold text-xl">
            P
          </div>
        </div>
        <span className="text-white font-bold text-xl">PayPulse</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-gray-300">
          Hello, <span className="text-white font-semibold">{username}</span>
        </div>
        <div className="rounded-full h-10 w-10 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg border-2 border-orange-400">
          <div className="text-white font-bold text-lg">
            {username[0].toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appbar;
