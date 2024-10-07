import { Link } from 'react-router-dom';
import { useContext } from 'react'
import { WalletContext } from '../context/WalletContext';

import Logo from '../assets/logo.png'

const Header = () => {
const { walletAddress, connectWallet } = useContext(WalletContext);

const truncateAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;  
};

  return (
    <nav className='px-[2.5rem] h-[5rem] flex flex-row items-center justify-between text-white bg-indigo'>
        <Link to={'/'} className='flex flex-row items-center justify-center gap-[0.25rem] cursor-pointer'>
          <img src={Logo} alt="" className='h-auto w-full max-w-[5rem] object-cover'/>
          <h1 className='text-[2.25rem]'>Quizzz</h1>
        </Link>
        <button
        onClick={connectWallet}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        {walletAddress ? `Connected: ${truncateAddress(walletAddress)}` : 'Connect Wallet'}
      </button>
    </nav>
  )
}

export default Header
