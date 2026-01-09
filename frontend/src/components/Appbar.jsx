import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Appbar = ({ username = 'Dexter' }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true, // Important for cookie handling
        }
      );

      // Clear local storage
      localStorage.removeItem('token');

      // Redirect to signin page
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the backend call fails, clear local storage and redirect
      localStorage.removeItem('token');
      navigate('/signin');
    }
  };

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
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-red-600/20 border border-slate-600 hover:border-red-500 text-gray-300 hover:text-red-400 transition-all duration-200 group"
          aria-label="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Appbar;
