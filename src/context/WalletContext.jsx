import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const WalletContext = createContext();

const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem('walletAddress') || null);

  const connectWallet = async () => {
    try {
      if (window.tronWeb && window.tronWeb.ready) {
        const address = window.tronWeb.defaultAddress.base58;
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
      } else {
        alert("Install or unlock TronLink");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    if (window.tronWeb && window.tronWeb.ready) {
      const address = window.tronWeb.defaultAddress.base58;
      setWalletAddress(address);
      localStorage.setItem('walletAddress', address);
    }
  }, []);

  return (
    <WalletContext.Provider value={{ walletAddress, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

WalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default WalletProvider;
