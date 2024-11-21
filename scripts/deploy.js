const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying...");
    
    const taskManagerContract = await ethers.getContractFactory("TaskManager");
    const taskManagerContractDeployed = await taskManagerContract.deploy();

    await taskManagerContractDeployed.deployed();

    console.log("TaskManager deployed to:", taskManagerContractDeployed.address);

    const addressPath = path.resolve(__dirname, "../deployed/contract-address.txt");
    fs.writeFileSync(addressPath, taskManagerContractDeployed.address, { encoding: "utf-8" });

    console.log("Contract address saved to:", addressPath);

    const abiPath = path.resolve(__dirname, "../deployed/contract-abi.json");
    fs.writeFileSync(abiPath, JSON.stringify(taskManagerContract.interface.format(ethers.utils.FormatTypes.json), null, 2), { encoding: "utf-8" });

    console.log("Contract ABI saved to:", abiPath);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });