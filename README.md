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

* Deploy to linea_mainnet

    ```npx hardhat run scripts/deploy.js --network linea_mainnet```

* Deploy to linea_testnet

    ```npx hardhat run scripts/deploy.js --network linea_testnet```

* Deploy to localhost
    
    Run node server in separate console or in background
    ```npx hardhat node```

    ```npx hardhat run scripts/deploy.js --network localhost```

    **Deployment to localhost is not validated with Unit Tests automatically!**



# After deployment:
* The `localhost` deployment artifacts are stored in the `localhost_deploy` directory.
* The `linea_mainnet` and `linea_testnet` deployment artifacts are stored in the `deploy` directory.
* The TaskManager contract address will be saved to `TaskManagerAddress.json`.
* The UserManager contract address will be saved to `TaskManagerAddress.json`.
* The TaskManager ABI will be saved to `TaskManagerABI.json`.
* The UserManager ABI will be saved to `UserManagerABI.json`.
* `deploy` is in fact a submodule of https://github.com/jdrachal/BounySmartContractDeploy.git
so remember to bump the version in version.json and create a patch!

# Unit testing
Run `npm test`

