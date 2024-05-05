import React from 'react'
import { Heading, SubHeading, InputBox, Button, BottomWarning } from '../components'


function SignIn() {
  return (
    <div className='flex justify-center bg-slate-300 h-screen'>
      <div className='flex flex-col justify-center'>
        <div className='rounded-lg bg-white w-80 text-center p-2 h-max px-4'>
          <Heading label={'Sign In'} />
          <SubHeading label={'Welcome back ! Enter your credentials to access your account'} />
          
          <InputBox forN={'email'} label={'Email'} holder={'Email'} />
          <InputBox forN={'password'} label={'Password'} holder={'Password'} />
          <div className='pt-4'>
            <Button label={'Sign In'} />
          </div>
          <div className='text-slate-500'> OR</div>
          <button type="button" className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2 mt-3">
            <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
              <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd" />
            </svg>
            Sign in with Google
          </button>
          <BottomWarning label={'Don’t have an account?'} to={'/signup'} buttonText={'Sign Up'} />
        </div>
      </div>
    </div>
  )
}

export default SignIn