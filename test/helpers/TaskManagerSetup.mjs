import { deployMockContract } from "@ethereum-waffle/mock-contract";
import hardhat from "hardhat";
const { ethers } = hardhat;

const ROLE_NONE = 0;
const ROLE_VIEWER = 1;
const ROLE_ASSIGNEE = 2;
const ROLE_MAINTAINER = 3;

// The setup function returns an object with all necessary values
export async function setup() {
    // Get signers (addresses)
    const [owner, maintainer, assignee, viewer, none] = await ethers.getSigners();

    // Deploy the mock UserManager contract
    const UserManager = await ethers.getContractFactory("UserManager");
    const userManagerMock = await deployMockContract(owner, UserManager.interface.format(ethers.utils.FormatTypes.json));

    // Deploy the TaskManager contract with the mock UserManager
    const TaskManagerFactory = await ethers.getContractFactory("TaskManager");
    const taskManager = await TaskManagerFactory.deploy(userManagerMock.address);
    await taskManager.deployed();

    await userManagerMock.mock.getRole.withArgs(owner.address).returns(ROLE_NONE);
    await userManagerMock.mock.getRole.withArgs(maintainer.address).returns(ROLE_MAINTAINER);
    await userManagerMock.mock.getRole.withArgs(assignee.address).returns(ROLE_ASSIGNEE);
    await userManagerMock.mock.getRole.withArgs(viewer.address).returns(ROLE_VIEWER);
    await userManagerMock.mock.getRole.withArgs(none.address).returns(ROLE_NONE);
    await userManagerMock.mock.hasUser.withArgs(owner.address).returns(false);
    await userManagerMock.mock.hasUser.withArgs(maintainer.address).returns(true);
    await userManagerMock.mock.hasUser.withArgs(assignee.address).returns(true);
    await userManagerMock.mock.hasUser.withArgs(viewer.address).returns(true);
    await userManagerMock.mock.hasUser.withArgs(none.address).returns(true);

    // Return the setup information as an object
    return {
        owner: owner,
        maintainer: maintainer,
        assignee: assignee,
        viewer: viewer,
        none: none,
        userManagerMock: userManagerMock,
        taskManager: taskManager,
    };
}  
