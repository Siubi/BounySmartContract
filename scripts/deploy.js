import hardhat from "hardhat";
const { ethers, network} = hardhat;
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
    try {
      console.log("Running tests...");
      await run("test");
      console.log("All tests passed.");
    } catch (error) {
      console.error("Tests failed. Deployment aborted.");
      process.exit(1); // Exit with error code
    }
  }

async function main() {
    const isLocalhost = network.name === "localhost";


    console.log("Compiling...");
    await run('compile');

    if (!isLocalhost) {
        await runTests();
    }

    let deployFolder = path.resolve(__dirname, "../localhost_deploy");
    if (!isLocalhost) {
        deployFolder = path.resolve(__dirname, "../deploy");
    }

    if (!fs.existsSync(deployFolder)) {
        fs.mkdirSync(deployFolder);
    }

    console.log("Deploying UserManager...");
    const UserManager = await ethers.getContractFactory("UserManager");
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
    const TaskManager = await ethers.getContractFactory("TaskManager");
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
