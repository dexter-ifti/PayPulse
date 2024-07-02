const Appbar = ({username = 'Dexter'}) => {

  
  return <div className="shadow h-14 flex justify-between ">
    <div className="flex flex-row justify-center items-center h-full ml-4 font-medium from-stone-900 ">
      <div className="rounded-full h-12 w-12 light:bg-slate-200 flex justify-center mt-1 mr-2 dark:bg-red-500 border-2">
        <div className="flex flex-col justify-center h-full text-xl">
          P
        </div>
      </div>
      PayPulse App
    </div>
    <div className="flex">
      <div className="flex flex-col justify-center h-full mr-4">
        Hello, {username}
      </div>
      <div className="rounded-full h-12 w-12 light:bg-slate-200 flex justify-center mt-1 mr-2 dark:bg-red-500 border-2">
        <div className="flex flex-col justify-center h-full text-xl">
          {username[0].toUpperCase()}
        </div>
      </div>
    </div>
  </div>
}

export default Appbar