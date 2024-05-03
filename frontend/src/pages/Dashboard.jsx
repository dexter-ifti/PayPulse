import React from 'react'
import Appbar from '../components/Appbar'
import Balance from '../components/Balance'
import Users from '../components/Users'

function Dashboard() {
  return (
    <div className='m-4'>
      <Appbar/>
      <Balance value={'10,000'}/>
      <Users/>
    </div>
  )
}

export default Dashboard