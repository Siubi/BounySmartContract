const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    
    console.log("Compiling...");
    await hre.run('compile');

    const deployFolder = path.resolve(__dirname, "../deploy");
    if (!fs.existsSync(deployFolder)) {
        fs.mkdirSync(deployFolder);
    }

    console.log("Deploying UserManager...");
    const UserManager = await hre.ethers.getContractFactory("UserManager");
    const userManager = await UserManager.deploy();
    await userManager.deployed();
    console.log("UserManager deployed to:", userManager.address);

    fs.writeFileSync(
        path.join(deployFolder, "UserManagerAddress.json"),
        JSON.stringify({ address: userManager.address }, null, 2)
    );

    fs.writeFileSync(
        path.join(deployFolder, "UserManagerABI.json"),
        JSON.stringify(JSON.parse(userManager.interface.format('json')), null, 2)
    );
    
    console.log("Deploying TaskManager...");
    const TaskManager = await hre.ethers.getContractFactory("TaskManager");
    const taskManager = await TaskManager.deploy(userManager.address);
    await taskManager.deployed();
    console.log("TaskManager deployed to:", taskManager.address);

    fs.writeFileSync(
        path.join(deployFolder, "TaskManagerAddress.json"),
        JSON.stringify({ address: taskManager.address }, null, 2)
    );

    fs.writeFileSync(
        path.join(deployFolder, "TaskManagerABI.json"),
        JSON.stringify(JSON.parse(taskManager.interface.format('json')), null, 2)
    );

    console.log("Deployment complete");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });