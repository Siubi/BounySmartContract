require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    linea_testnet: {
      url: "https://linea-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};