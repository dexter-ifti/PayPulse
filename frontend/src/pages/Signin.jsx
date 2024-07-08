import React from 'react'
import { Heading, SubHeading, InputBox, Button, BottomWarning } from '../components'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Signin() {
  const [username, setUserName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigate = useNavigate();
  return (
    <div className='bg-slate-500 h-screen flex justify-center'>
      <div className="flex flex-col justify-center">
        <div className='rounded-lg light:bg-white dark:bg-zinc-950 w-80 text-center p-2 h-max px-4'>
          <Heading label={"Sign in"} />
          <SubHeading label={"Enter your information to create an account"} />
          <InputBox  onChange={e => setUserName(e.target.value)}
          label={"Email"} placeholder={"John@gmail.com"} />
          <InputBox onChange={e => setPassword(e.target.value)}
          label={"Password"} placeholder={"123456"} />
          <div className="pt-4">
            <Button onClick={() => {
              const response = axios.post('https://paypulse-zyer.onrender.com/api/v1/user/signin', {
                username,
                password
            });
            localStorage.setItem('token', response.data.token)
              navigate('/dashboard', { state: { firstName } });
          }}  
            label={"Sign in"} />
          </div>
          <BottomWarning label={"New Here ? Create Account !"} buttonText={"Sign up"} to={'/signup'} />
        </div>
      </div>
    </div >
  )
}

export default Signin
