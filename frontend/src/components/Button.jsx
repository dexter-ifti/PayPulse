import React from 'react'

function Button({label, onClick, disabled = false}) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      type="button" 
      className="w-full py-3 px-6 text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {label}
    </button>
  )
}

export default Button;
