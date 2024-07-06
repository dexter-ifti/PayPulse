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
    <div className='bg-slate-500 h-screen flex justify-center'>
      <div className="flex flex-col justify-center">
        <div className='rounded-lg light:bg-white  dark:bg-zinc-950 w-80 text-center p-2 h-max px-4'>
          <Heading label={"Sign up"} />
          <SubHeading label={"Enter your information to create an account"} />
          <InputBox  onChange={e => setFirstName(e.target.value)}
           label={"First Name"} placeholder={"John"} />
          <InputBox  onChange={e => setLastName(e.target.value)}
           label={"Last Name"} placeholder={"Doe"} />
          <InputBox  onChange={e => setUserName(e.target.value)}
           label={"Username"} placeholder={"John@gmail.com"} />
          <InputBox  onChange={e => setPassword(e.target.value)}
           label={"Password"} placeholder={"123456"} />
          <div className="pt-4">
            <Button onClick = {async () => {
              const response = await axios.post('api/v1/user/signup', {
                firstName,
                lastName,
                username,
                password
              });
              localStorage.setItem('token', response.data.token);
              navigate('/dashboard', {state: {firstName}});
            }}
            label={"Sign up"} />
          </div>
          <BottomWarning label={"Already Have an account ?"} buttonText={"Sign in"} to={'/signin'} />
        </div>
      </div>
    </div >
  )
}

export default Signup
