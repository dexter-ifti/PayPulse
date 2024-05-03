import React, { useState } from 'react'
import { Heading, SubHeading, InputBox, Button, BottomWarning } from '../components'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function SignUp() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const naigate = useNavigate();
  return (
    <div className='bg-slate-300 h-screen flex justify-center'>
      <div className='flex flex-col justify-center'>
        <div className='rounded-lg bg-white w-80 text-center p-2 h-max px-4'>
          <Heading label={"Sign Up"} />
          
          <SubHeading label={"Enter Your Information to Create an Account"} />
          <InputBox onChange={(e) => {setFirstName(e.target.value)}} label={"First Name"} forN={'fName'} holder={'Enter the First Name'} />
          <InputBox onChange={(e) => {setLastName(e.target.value)}} label={"Last Name"} forN={'lName'} holder={'Enter the Last Name'} />
          <InputBox onChange={(e) =>{ setUsername(e.target.value)}} label={"Email"} forN={'ema'} holder={'Enter Your Mail'} />
          <InputBox onChange={(e) =>{ setPassword(e.target.value)}} label={"Password"} forN={'pass'} holder={"Set Your Password"} />
          {/* <InputBox onChange={(e) => {setPassword(e.target.value)}} forN={'pass'} holder={"Confirm Your Password"} /> */}
          <div className='pt-4'>
            <Button onClick={async () => {
              const response = await axios.post('http://localhost:5173/api/v1/user/signup', {
                username,
                firstName,
                lastName,
                password
              });
              localStorage.setItem('token', response.data.token);
              naigate('/dashboard');
            }} label={"Sign Up"} />
            </div>
          
          <BottomWarning label={'Already have an Account ?'} to={'/signin'} buttonText={'Sign In'} />
        </div>
      </div>
    </div>
  )
}

export default SignUp