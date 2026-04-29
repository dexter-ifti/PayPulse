import React from 'react'

function InputBox({label, placeholder, onChange, onBlur, error, type = "text", value}) {
  return (
    <div className='text-left'>
      <div className='text-sm font-medium text-gray-300 mb-2'>
        {label}
      </div>
      <input 
        onChange={onChange}
        onBlur={onBlur}
        type={type} 
        placeholder={placeholder}
        value={value}
        className={`w-full px-4 py-3 rounded-xl border bg-slate-700/50 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-slate-600 focus:ring-orange-500'
        }`}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-[fadeSlideIn_0.2s_ease-out]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default InputBox;
