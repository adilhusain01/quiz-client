// import { Link } from 'react-router-dom';
// import { useContext } from 'react'
// import { WalletContext } from '../context/WalletContext';

// import Logo from '../assets/logo.png'

// const Header = () => {
// const { walletAddress, connectWallet } = useContext(WalletContext);

// const truncateAddress = (address) => {
//   if (!address) return '';
//   return `${address.slice(0, 4)}...${address.slice(-4)}`;  
// };

//   return (
//     <nav className='px-[6rem] h-[6rem] flex flex-row items-center justify-between text-white bg-[#321055]'>
//         <Link to={'/'} className='flex flex-row items-center justify-center gap-[0.25rem] cursor-pointer'>
//           <img src={Logo} alt="" className='h-auto w-full max-w-[3.5rem] object-cover'/>
//           <h1 className='text-[2.25rem] font-bold'>Vibe</h1>
//         </Link>
//         <button
//         onClick={connectWallet}
//         className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
//       >
//         {walletAddress ? `Connected: ${truncateAddress(walletAddress)}` : 'Connect Wallet'}
//       </button>
//     </nav>
//   )
// }

// export default Header


import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';
import { Wallet, Menu } from 'lucide-react';
import Logo from '../assets/logo.png';

const Header = () => {
  const { walletAddress, connectWallet } = useContext(WalletContext);

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <nav className="px-4 md:px-24 h-24 flex items-center justify-between bg-white/5 backdrop-blur-lg border-b border-white/10">
      <Link 
        to="/" 
        className="flex items-center gap-2 group"
      >
        <div className="relative w-14 h-14 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-2 transition-all duration-300 group-hover:scale-105">
          <img 
            src={Logo} 
            alt="Vibe Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold">
          <span className="text-white">Vibe</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Quiz</span>
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/25"
        >
          <Wallet size={20} />
          {walletAddress ? truncateAddress(walletAddress) : 'Connect Wallet'}
        </button>
        
        <button className="p-2 text-white/80 hover:text-white md:hidden">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Header;