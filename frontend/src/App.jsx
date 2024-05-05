import React from 'react'
import { SignUp, SignIn, Dashboard, SendMoney } from './pages'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/send' element={<SendMoney />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
