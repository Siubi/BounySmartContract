import { expect, use } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;
import { setup } from "../helpers/TaskManagerSetup.mjs";

import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

describe("TaskManager - Access Control", function () {
  let userManagerMock, taskManager;
  let owner, maintainer, assignee, viewer, none;
  let unprivilegedUsers;
  const taskTitle = "Title";
  const taskDescription = "Description";

  beforeEach(async () => {
    // Initialize the setup by calling the setup function
    ({
        owner,
        maintainer,
        assignee,
        viewer,
        none,
        unprivilegedUsers,
        userManagerMock,
        taskManager
    } = await setup());

    unprivilegedUsers = [none, viewer, assignee];

    // Create a task as the owner
    await taskManager.connect(owner).createTask(taskTitle, taskDescription);
  });

  describe("Access positive tests", function () {
    it("Should allow owner to add the new task", async function () {
      await expect(
        taskManager.connect(owner).createTask(taskTitle, taskDescription)
      ).to.be.fulfilled;
    });

    it("Should allow owner to set assignee", async function () {
      await expect(
        taskManager.connect(owner).setAssignee(0, maintainer.address)
      ).to.be.fulfilled;
    });

    it("Should allow owner to update task status", async function () {
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
      await taskManager.connect(owner).setAssignee(0, maintainer.address);
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      await taskManager.connect(owner).updateTaskStatus(0, 2);
      await expect(
        taskManager.connect(owner).completeTask(0)
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to add the new task", async function () {
      await expect(
        taskManager.connect(maintainer).createTask(taskTitle, taskDescription)
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to set assignee", async function () {
      await expect(
        taskManager.connect(maintainer).setAssignee(0, assignee.address)
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to update task status", async function () {
      await taskManager.connect(maintainer).setAssignee(0, assignee.address);
      await expect(
        taskManager.connect(maintainer).updateTaskStatus(0, 1)
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to deposit ETH", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await expect(
        taskManager.connect(maintainer).depositETH(0, { value: depositAmount })
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to complete task", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(maintainer).setAssignee(0, assignee.address);
      await taskManager.connect(maintainer).depositETH(0, { value: depositAmount });
      await taskManager.connect(maintainer).updateTaskStatus(0, 2);
      await expect(
        taskManager.connect(maintainer).completeTask(0)
      ).to.be.fulfilled;
    });
  });

  describe("Access negative tests", function () {

    it("Should not allow assignee, viewer, none to add the new task", async function () {   
      for (const [index, user] of unprivilegedUsers.entries()) {
        await expect(
          taskManager.connect(user).createTask(taskTitle, taskDescription)
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    it("Should not allow assignee, viewer, none to set assignee", async function () {
      for (const [index, user] of unprivilegedUsers.entries()) {
        await expect(
          taskManager.connect(user).setAssignee(0, assignee.address)
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    it("Should not allow assignee, viewer, none to update task status", async function () {
      await taskManager.connect(maintainer).setAssignee(0, assignee.address);
      for (const [index, user] of unprivilegedUsers.entries()) {
        await expect(
          taskManager.connect(user).updateTaskStatus(0, 1)
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    it("Should not allow assignee, viewer, none to deposit ETH", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      for (const [index, user] of unprivilegedUsers.entries()) {
        await expect(
          taskManager.connect(user).depositETH(0, { value: depositAmount })
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    it("Should not allow assignee, viewer, none to complete task", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(maintainer).setAssignee(0, assignee.address);
      await taskManager.connect(maintainer).depositETH(0, { value: depositAmount });
      await taskManager.connect(maintainer).updateTaskStatus(0, 2);
      for (const [index, user] of unprivilegedUsers.entries()) {
        await expect(
          taskManager.connect(user).completeTask(0)
        ).to.be.rejectedWith("Access denied: insufficient permissions");
      }
    });

    
  });
});
