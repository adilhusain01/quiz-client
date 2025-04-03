require("dotenv").config();

module.exports = {
  networks: {
    nile: {
      privateKey: process.env.PRIVATE_KEY,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: "https://nile.trongrid.io/",
      network_id: "201910292",
    },
  },
};
