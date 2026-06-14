import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const limit = 5;

  useEffect(() => {
    let active = true;
    setLoading(true);
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/bulk?filter=${encodeURIComponent(filter)}&page=${currentPage}&limit=${limit}`, {
      withCredentials: true, // Send cookies with request
    })
      .then(response => {
        if (!active) return;
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      })
      .catch(() => { if (active) setUsers([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
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

  const pageBtn = (enabled) =>
    `px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
      enabled
        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 motion-safe:hover:scale-[1.03] shadow-md'
        : 'bg-slate-700 text-gray-400 cursor-not-allowed'
    }`;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
      <h2 className="font-bold text-2xl text-white mb-4">
        Users
      </h2>
      <div className="mb-6">
        <label htmlFor="user-search" className="sr-only">Search users</label>
        <input
          id="user-search"
          onChange={e => setFilter(e.target.value)}
          type="text"
          placeholder="Search by name…"
          className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[68px] rounded-xl bg-slate-700/30 border border-slate-600/40 motion-safe:animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-300 font-medium">No people found</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter ? `No one matches “${filter}”.` : 'There’s no one to show yet.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {users.map(user => <User key={user._id} user={user} />)}
        </ul>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-700 pt-4">
          <div className="text-sm text-gray-400">
            Page {currentPage} of {pagination.totalPages} • {pagination.totalUsers} users
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrevPage} disabled={!pagination.hasPrevPage} className={pageBtn(pagination.hasPrevPage)}>
              Previous
            </button>
            <button onClick={handleNextPage} disabled={!pagination.hasNextPage} className={pageBtn(pagination.hasNextPage)}>
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
  const fullName = `${user.firstName} ${user.lastName}`;
  const initial = user.firstName ? [...user.firstName][0].toUpperCase() : 'U';

  return (
    <li className="flex justify-between items-center gap-3 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 border border-slate-600/50">
      <div className="flex items-center gap-3 min-w-0">
        <div className="rounded-full h-12 w-12 shrink-0 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
          <div className="text-white font-bold text-xl" aria-hidden="true">
            {initial}
          </div>
        </div>
        <div className="text-white font-medium truncate" title={fullName}>
          {fullName}
        </div>
      </div>
      <button
        onClick={() => {
          navigate(`/send?id=${encodeURIComponent(user._id)}&name=${encodeURIComponent(user.firstName)}`);
        }}
        className="px-5 py-2 shrink-0 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 motion-safe:hover:scale-[1.03] transition-all duration-200 shadow-md text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
        aria-label={`Send money to ${fullName}`}
      >
        Send
      </button>
    </li>
  );
}

export default Users;
