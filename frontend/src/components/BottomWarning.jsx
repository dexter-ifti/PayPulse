import React from 'react'
import { Link } from 'react-router-dom'

function BottomWarning({label, buttonText, to}) {
  return (
    <div className='text-sm py-4 flex justify-center text-gray-400'>
      <div>
        {label}
      </div>
      <Link 
        className='pl-1 cursor-pointer text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-200' 
        to={to}
      >
        {buttonText}
      </Link>
    </div>
  )
}

export default BottomWarning;
