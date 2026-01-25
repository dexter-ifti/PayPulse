import { useEffect, useState } from "react";
import Button from './Button';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const limit = 5;

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/bulk?filter=${filter}&page=${currentPage}&limit=${limit}`, {
      withCredentials: true, // Send cookies with request
    })
      .then(response => {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      });
  }, [filter, currentPage]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300">
      <div className="font-bold text-2xl text-white mb-4">
        Users
      </div>
      <div className="mb-6">
        <input
          onChange={e => setFilter(e.target.value)}
          type="text"
          placeholder="Search users..."
          className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
      </div>
      <div className="space-y-3">
        {users.map(user => <User key={user._id} user={user} />)}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-700 pt-4">
          <div className="text-sm text-gray-400">
            Page {currentPage} of {pagination.totalPages} • {pagination.totalUsers} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.hasPrevPage}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${pagination.hasPrevPage
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transform hover:scale-105 shadow-md'
                : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${pagination.hasNextPage
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transform hover:scale-105 shadow-md'
                : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function User({ user }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/50">
      <div className="flex items-center space-x-3">
        <div className="rounded-full h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
          <div className="text-white font-bold text-xl">
            {user.firstName[0].toUpperCase()}
          </div>
        </div>
        <div className="text-white font-medium">
          {user.firstName} {user.lastName}
        </div>
      </div>
      <button
        onClick={() => {
          navigate("/send?id=" + user._id + "&name=" + user.firstName);
        }}
        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
      >
        Send Money
      </button>
    </div>
  );
}

export default Users;
