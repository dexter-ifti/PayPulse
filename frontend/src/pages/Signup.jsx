import React, { useState } from 'react'
import { Heading, SubHeading, InputBox, Button, BottomWarning } from '../components'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4 overflow-hidden'>
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="flex flex-col justify-center relative z-10 w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg">
              P
            </div>
            <span className="text-3xl font-bold text-white">PayPulse</span>
          </div>
          <p className="text-gray-400">Create your account to get started</p>
        </div>

        <div className='rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 w-full text-center p-8 shadow-2xl hover:border-orange-500/50 transition-all duration-300'>
          {/* Decorative top bar with gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-t-2xl"></div>
          
          <Heading label={"Sign up"} />
          <SubHeading label={"Enter your information to create an account"} />
          
          <div className="space-y-4 mt-6">
            <InputBox 
              onChange={e => setFirstName(e.target.value)}
              label={"First Name"} 
              placeholder={"John"} 
            />
            <InputBox 
              onChange={e => setLastName(e.target.value)}
              label={"Last Name"} 
              placeholder={"Doe"} 
            />
            <InputBox 
              onChange={e => setUserName(e.target.value)}
              label={"Username"} 
              placeholder={"John@gmail.com"} 
            />
            <InputBox 
              onChange={e => setPassword(e.target.value)}
              label={"Password"} 
              placeholder={"123456"} 
            />
          </div>
          
          <div className="pt-6">
            <Button 
              onClick={async () => {
                const response = await axios.post('https://paypulse-zyer.onrender.com/api/v1/user/signup', {
                  firstName,
                  lastName,
                  username,
                  password
                });
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard', {state: {firstName}});
              }}
              label={"Sign up"} 
            />
          </div>
          
          <BottomWarning 
            label={"Already Have an account ?"} 
            buttonText={"Sign in"} 
            to={'/signin'} 
          />
        </div>

        {/* Trust badge */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-slate-800/30 backdrop-blur-sm px-6 py-2 rounded-full border border-slate-700">
            <span className="text-orange-400 text-sm font-semibold">🔒 Secure & Encrypted</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}

export default Signup
