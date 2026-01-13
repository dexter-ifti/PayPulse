import { useEffect, useState } from "react";
import Button from './Button';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/bulk?filter=` + filter, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then(response => {
        setUsers(response.data.user);
      });
  }, [filter]);

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
