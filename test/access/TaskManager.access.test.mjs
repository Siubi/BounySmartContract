import { smock } from '@defi-wonderland/smock';
import { expect, use } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

import chaiAsPromised from "chai-as-promised";

use(smock.matchers);
use(chaiAsPromised);

describe("TaskManager - Access Control", function () {
  let userManagerMock, taskManager;
  let owner, maintainer, assignee, viewer, none;
  let unprevilagedUsers;
  const ROLE_MAINTAINER = 3;
  const taskTitle = "Title";
  const taskDescription = "Description";

  beforeEach(async function () {
    // Deploy the mock UserManager contract
    const UserManagerMockFactory = await smock.mock("UserManager");
    userManagerMock = await UserManagerMockFactory.deploy();
    await userManagerMock.deployed();
    

    // Deploy the contract
    const TaskManagerFactory = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManagerFactory.deploy(userManagerMock.address);
    await taskManager.deployed();

    // Get signers
    [owner, maintainer, assignee, viewer, none] = await ethers.getSigners();
    unprevilagedUsers = [none, viewer, assignee];
    await taskManager.connect(owner).createTask(taskTitle, taskDescription);
  });

  describe("Access positive tests", function () {
    it("Should allow owner to add the new task", async function () {
      await expect(
        taskManager.connect(owner).createTask(taskTitle, taskDescription)
      ).to.be.fulfilled;
    });

    it("Should allow owner to set assignee", async function () {
      userManagerMock.hasUser.returns(true);
      await expect(
        taskManager.connect(owner).setAssignee(0, maintainer.address)
      ).to.be.fulfilled;
    });

    it("Should allow owner to update task status", async function () {
      userManagerMock.hasUser.returns(true);
      await taskManager.connect(owner).setAssignee(0, maintainer.address);
      await expect(
        taskManager.connect(owner).updateTaskStatus(0, 1)
      ).to.be.fulfilled;
    });

    it("Should allow owner to deposit ETH", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await expect(
        taskManager.connect(owner).depositETH(0, { value: depositAmount })
      ).to.be.fulfilled;
    });

    it("Should allow owner to complete task", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      userManagerMock.hasUser.returns(true);
      await taskManager.connect(owner).setAssignee(0, maintainer.address);
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      await taskManager.connect(owner).updateTaskStatus(0, 2);
      await expect(
        taskManager.connect(owner).completeTask(0)
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to add the new task", async function () {
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      await expect(
        taskManager.connect(maintainer).createTask(taskTitle, taskDescription)
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to set assignee", async function () {
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      userManagerMock.hasUser.returns(true);
      await expect(
        taskManager.connect(maintainer).setAssignee(0, assignee.address)
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to update task status", async function () {
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      userManagerMock.hasUser.returns(true);
      await taskManager.connect(maintainer).setAssignee(0, assignee.address);
      await expect(
        taskManager.connect(maintainer).updateTaskStatus(0, 1)
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to deposit ETH", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      await expect(
        taskManager.connect(maintainer).depositETH(0, { value: depositAmount })
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to complete task", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      userManagerMock.hasUser.returns(true);
      await taskManager.connect(maintainer).setAssignee(0, assignee.address);
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      await taskManager.connect(maintainer).depositETH(0, { value: depositAmount });
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      await taskManager.connect(maintainer).updateTaskStatus(0, 2);
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      await expect(
        taskManager.connect(maintainer).completeTask(0)
      ).to.be.fulfilled;
    });
  });

  describe("Access negative tests", function () {

    it("Should not allow assignee, viewer, none to add the new task", async function () {   
      for (const [index, user] of unprevilagedUsers.entries()) {
        userManagerMock.getRole.returns(index);
        await expect(
          taskManager.connect(user).createTask(taskTitle, taskDescription)
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    it("Should not allow assignee, viewer, none to set assignee", async function () {
      for (const [index, user] of unprevilagedUsers.entries()) {
        userManagerMock.getRole.returns(index);
        userManagerMock.hasUser.returns(true);
        await expect(
          taskManager.connect(user).setAssignee(0, assignee.address)
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    it("Should not allow assignee, viewer, none to update task status", async function () {
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      userManagerMock.hasUser.returns(true);
      await taskManager.connect(maintainer).setAssignee(0, assignee.address);
      for (const [index, user] of unprevilagedUsers.entries()) {
        userManagerMock.getRole.returns(index);
        await expect(
          taskManager.connect(user).updateTaskStatus(0, 1)
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    it("Should not allow assignee, viewer, none to deposit ETH", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      for (const [index, user] of unprevilagedUsers.entries()) {
        userManagerMock.getRole.returns(index);
        await expect(
          taskManager.connect(user).depositETH(0, { value: depositAmount })
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    it("Should not allow assignee, viewer, none to complete task", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      userManagerMock.hasUser.returns(true);
      await taskManager.connect(maintainer).setAssignee(0, assignee.address);
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      await taskManager.connect(maintainer).depositETH(0, { value: depositAmount });
      userManagerMock.getRole.returns(ROLE_MAINTAINER);
      await taskManager.connect(maintainer).updateTaskStatus(0, 2);
      for (const [index, user] of unprevilagedUsers.entries()) {
        userManagerMock.getRole.returns(index);
        await expect(
          taskManager.connect(user).completeTask(0)
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    
  });
});
