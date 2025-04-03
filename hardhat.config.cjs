require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
// const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  solidity: "0.8.27",
  networks: {
    trx: {
      url: `https://nile.trongrid.io/`, // Nile testnet
      network_id: "201910292",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 201910292,
      gasPrice: 20000000000,
      gas: 8000000,
    },
  },
};
