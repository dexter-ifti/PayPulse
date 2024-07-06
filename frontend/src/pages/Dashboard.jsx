import React, { useEffect, useState } from 'react'
import { Appbar, Balance, Users } from '../components'
import { useLocation } from 'react-router-dom'
import axios from 'axios';

function Dashboard() {

  const location = useLocation();
  const { firstName } = location.state || {};
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get('/api/v1/account/balance', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setBalance(response.data.balance.toLocaleString());
      } catch (error) {
        console.error("Error fetching balance:", error.response ? error.response.data : error.message);
      }
    };

    fetchBalance();
  }, []);
  console.log(`Balance is : ${balance}`);
  
  return (
    <div className="m-8">
      <Appbar username={firstName} />
      <Balance value={balance} />
      <Users />
    </div>
  )
}

export default Dashboard