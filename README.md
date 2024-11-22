# BounySmartContract
Blockchain part of the Bouny project.  
This repository contains a smart contract project written in Solidity and managed using Hardhat.  
Follow the steps below to set up, deploy, and use the smart contract.

# Clone the Repository
```bash
git clone https://github.com/Siubi/BounySmartContract.git
cd BounySmartContract
git submodule update --init --recursive
```

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

* The TaskManager contract address will be saved to `deploy/TaskManagerAddress.json`.
* The UserManager contract address will be saved to `deploy/TaskManagerAddress.json`.
* The TaskManager ABI will be saved to `deploy/TaskManagerABI.json`.
* The UserManager ABI will be saved to `deploy/UserManagerABI.json`.
* deploy is in fact a submodule of https://github.com/jdrachal/BounySmartContractDeploy.git
so remember to bump the version in version.json and create a patch!
