const { ethers } = require("hardhat");

async function main() {
    const MyContract = await ethers.getContractFactory("TaskManager");
    const myContract = await MyContract.deploy();

    await myContract.deployed();

    console.log("TaskManager deployed to:", myContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}