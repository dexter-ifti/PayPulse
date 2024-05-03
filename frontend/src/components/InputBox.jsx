import React from 'react'

function InputBox({forN , label, holder, onChange}) {
  return (
    <>
    <div className='text-sm font-medium text-left py-2' htmlFor={forN}>{label}</div>
    <input onChange={onChange} type="text" placeholder={holder} name={forN} className='w-full px-2 py-1 border rounded border-slate-200'/>
    </>
  )
}

export default InputBox