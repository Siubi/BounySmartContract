require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0", // Specify your Solidity version
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          outputSelection: {
            "*": {
              "*": ["storageLayout"], // Enable storage layout output
            },
          },
        },
      },
    ],
  },
  networks: {
    linea_testnet: {
      url: "https://rpc.sepolia.linea.build/",
      accounts: [process.env.PRIVATE_KEY],
    },
    linea_mainnet: {
      url: `https://rpc.linea.build/`,
      accounts: [process.env.PRIVATE_KEY],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.PRIVATE_KEY],
    },
  },

};