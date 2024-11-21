require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    linea: {
      url: "https://linea-sepolia.infura.io",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};