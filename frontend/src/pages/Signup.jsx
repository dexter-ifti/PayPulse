import React, { useState, useEffect } from 'react'
import { Heading, SubHeading, InputBox, Button, BottomWarning } from '../components'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Redirect to dashboard if user is already logged in
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4 overflow-hidden'>
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
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
            <div className='text-left'>
              <div className='text-sm font-medium text-gray-300 mb-2'>
                Password
              </div>
              <div className="relative">
                <input
                  onChange={e => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder={"123456"}
                  className='w-full px-4 py-3 pr-12 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              onClick={async () => {
                // Show loading toast with server startup message
                const loadingToast = toast.loading('Creating account... Server may take a moment to start up.');

                try {
                  const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/signup`, {
                    firstName,
                    lastName,
                    username,
                    password
                  });

                  // Dismiss loading toast
                  toast.dismiss(loadingToast);
                  // Signup successful - redirect to signin page
                  toast.success(response.data.message || 'Account created successfully! Please sign in.');
                  navigate('/signin', { state: { username } });
                } catch (error) {
                  // Dismiss loading toast
                  toast.dismiss(loadingToast);
                  // Handle signup errors
                  const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
                  toast.error(errorMessage);
                }
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
