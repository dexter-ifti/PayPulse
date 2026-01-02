import React from 'react'

function InputBox({label, placeholder, onChange, type = "text"}) {
  return (
    <div className='text-left'>
      <div className='text-sm font-medium text-gray-300 mb-2'>
        {label}
      </div>
      <input 
        onChange={onChange}
        type={type} 
        placeholder={placeholder}
        className='w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
      />
    </div>
  )
}

export default InputBox;
