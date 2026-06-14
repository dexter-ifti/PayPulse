import { useEffect, useState } from 'react'
import { Appbar, Balance, Users, TransactionHistory } from '../components'
import { useLocation } from 'react-router-dom'
import axios from 'axios';

function Dashboard() {
  const location = useLocation();
  const { firstName } = location.state || {};
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/account/balance`, {
          withCredentials: true, // Send cookies with request
        });
        setBalance(response.data.data.balance.toLocaleString());
      } catch (error) {
        console.error("Error fetching balance:", error.response ? error.response.data : error.message);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Ambient background — pulse only when motion is welcome */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-3xl motion-safe:animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/10 rounded-full mix-blend-multiply filter blur-3xl motion-safe:animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        <Appbar username={firstName} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
            </h1>
            <p className="text-gray-400 mt-1">Here’s your money at a glance.</p>
          </header>
          <Balance value={balance} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Users />
            <TransactionHistory />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard;
