import { useState } from 'react'

import Logo from '../assets/logo.png'

const Header = () => {
const [isConnected, setIsConnected] = useState(false);

  return (
    <nav className='px-[2.5rem] h-[5rem] flex flex-row items-center justify-between text-white bg-indigo'>
        <span className='flex flex-row items-center justify-center gap-[0.25rem]'>
          <img src={Logo} alt="" className='h-auto w-full max-w-[5rem] object-cover'/>
          <h1 className='text-[2.25rem]'>Quizzz</h1>
        </span>
        <button onClick={() => setIsConnected(!isConnected)} className={`px-[1rem] py-[0.5rem] ${isConnected ? 'bg-green-500' : 'bg-red-500'} rounded-md`}>
            {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
    </nav>
  )
}

export default Header
