import { expect, use } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;
import { setup } from "../helpers/TaskManagerSetup.mjs";

import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

describe("TaskManager - events", function () {
  let userManagerMock, taskManager;
  let owner, maintainer, assignee, viewer, none;
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
        userManagerMock,
        taskManager
    } = await setup());

    await taskManager.connect(owner).createTask(taskTitle, taskDescription);
  });

  describe("Event positive tests", function () {

    it("Should emit TaskCreated when new task is created", async function () {
      await expect(
        taskManager.connect(owner).createTask(taskTitle, taskDescription)
      ).to.emit(taskManager, "TaskCreated")
      .withArgs(1, taskTitle, taskDescription);
    });

    it("Should emit AssigneeSet when the assignee is set", async function () {
      await expect(
        taskManager.connect(owner).setAssignee(0, maintainer.address)
      ).to.emit(taskManager, "AssigneeSet")
      .withArgs(0, maintainer.address);
    });

    it("Should emit TaskStatusUpdated when the task status is updated", async function () {
      await taskManager.connect(owner).setAssignee(0, maintainer.address);
      await expect(
        taskManager.connect(owner).updateTaskStatus(0, 1)
      ).to.emit(taskManager, "TaskStatusUpdated")
      .withArgs(0, 1);
    });

    it("Should emit ETHDeposited when the ETH is deposited", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await expect(
        taskManager.connect(owner).depositETH(0, { value: depositAmount })
      ).to.emit(taskManager, "ETHDeposited")
      .withArgs(0, depositAmount);
    });

    it("Should emit TaskCompleted when the task is completed", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(owner).setAssignee(0, maintainer.address);
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      await taskManager.connect(owner).updateTaskStatus(0, 2);
      await expect(
        taskManager.connect(owner).completeTask(0)
      ).to.emit(taskManager, "TaskCompleted")
      .withArgs(0, maintainer.address);
    });
  });

  describe("Event negative tests", function () {

    it("Should not emit AssigneeSet when the user is not added", async function () {
      expect(
        taskManager.connect(owner).setAssignee(0, maintainer.address)
      ).to.not.emit(taskManager, "AssigneeSet");
    });

    it("Should not emit TaskStatusUpdated when the assignee is not set", async function () {
      expect(
        taskManager.connect(owner).updateTaskStatus(0, 1)
      ).to.not.emit(taskManager, "TaskStatusUpdated");
    });

    it("Should not emit TaskCompleted when the reward is not set", async function () {
      await taskManager.connect(owner).setAssignee(0, maintainer.address);
      await taskManager.connect(owner).updateTaskStatus(0, 2);
      expect(
        taskManager.connect(owner).completeTask(0)
      ).to.not.emit(taskManager, "TaskCompleted");
    });

    it("Should not emit TaskCompleted when the task status is not validate", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(owner).setAssignee(0, maintainer.address);
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      expect(
        taskManager.connect(owner).completeTask(0)
      ).to.not.emit(taskManager, "TaskCompleted");
    });
  });
});
