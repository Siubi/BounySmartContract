# BounySmartContract
Blockchain part of the Bouny project.  
This repository contains a smart contract project written in Solidity and managed using Hardhat.  
Follow the steps below to set up, deploy, and use the smart contract.

# Setup
**1. Run the following command to install all required dependencies:**

```npm install```

**2. Configure environment variables**
   
Create `.env` file in the project root. The .env file should look like this:

```PRIVATE_KEY="INSERT_YOUR_PRIVATE_KEY_HERE"```

**3. Compile the contract**

Compile the Solidity contracts using Hardhat:

```npx hardhat compile```

**4. Deploy the contract**

```npx hardhat run scripts/deploy.js --network linea_testnet```

# After deployment:

* The contract address will be saved to deployed/contract-address.txt.
* The ABI will be saved to deployed/contract-abi.json.
