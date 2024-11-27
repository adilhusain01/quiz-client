import { Link } from "react-router-dom";
import { useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import { Wallet, Menu } from "lucide-react";
import Logo from "../assets/logo.png";

const Header = () => {
  const { walletAddress, connectWallet } = useContext(WalletContext);

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <nav className="px-4 md:px-24 h-20 md:h-24 flex items-center justify-between bg-white/5 backdrop-blur-lg border-b border-white/10">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="relative w-8 h-8 md:w-14 md:h-14 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-md md:rounded-xl md:p-2 transition-all duration-300 group-hover:scale-105">
          <img
            src={Logo}
            alt="Vibe Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl md:text-3xl font-bold">
          <span className="text-white">Vibe</span>
          {/* <span className='text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400'>
            Quiz
          </span> */}
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 px-3 md:px-6 py-1 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-md md:rounded-xl text-white font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-red-500/25"
        >
          <Wallet size={20} />
          {walletAddress ? truncateAddress(walletAddress) : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
};

export default Header;
