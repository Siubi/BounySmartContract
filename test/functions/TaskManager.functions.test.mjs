import { smock } from '@defi-wonderland/smock';
import { expect } from "chai";
import hardhat from "hardhat"
const { ethers } = hardhat;

describe("TaskManager - functions", function () {
  let userManagerMock, taskManager;
  let owner, maintainer, assignee, viewer, none;
  let unprevilagedUsers;
  const STATUS_BACKLOG = 0;
  const STATUS_IN_PROGRESS = 1;
  const STATUS_VALIDATE = 2;
  const STATUS_DONE = 3;
  const taskTitle1 = "Title1";
  const taskDescription1 = "Description1";
  const taskTitle2 = "Title2";
  const taskDescription2 = "Description2";

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
    await taskManager.connect(owner).createTask(taskTitle1, taskDescription1);
    userManagerMock.hasUser.returns(true);
    await taskManager.connect(owner).setAssignee(0, assignee.address);
    await taskManager.connect(owner).createTask(taskTitle2, taskDescription2);
  });

  describe("Functions positive tests", function () {

    it("Should get the task by id", async function () {
      const task = await taskManager.connect(owner).getTaskById(0);
      expect(task.title).to.equal(taskTitle1);
      expect(task.description).to.equal(taskDescription1);
      expect(task.assignee).to.equal(assignee.address);
    });

    it("New task should be created", async function () {
      const taskTitle = "NewTitle";
      const taskDescription = "NewDescription";
      await taskManager.connect(owner).createTask(taskTitle, taskDescription);

      const task = await taskManager.connect(owner).getTaskById(2);
      expect(task.title).to.equal(taskTitle);
      expect(task.description).to.equal(taskDescription);
    });

    it("Assignee should be set", async function () {
      userManagerMock.hasUser.returns(true);
      await taskManager.connect(owner).setAssignee(1, none.address);

      const task = await taskManager.connect(owner).getTaskById(1);
      expect(task.assignee).to.equal(none.address);
    });

    it("Task status should be updated", async function () {
      await taskManager.connect(owner).updateTaskStatus(0, STATUS_IN_PROGRESS);

      const task = await taskManager.connect(owner).getTaskById(0);
      expect(task.status).to.equal(STATUS_IN_PROGRESS);
    });

    it("The ETH should be deposited", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });

      const task = await taskManager.connect(owner).getTaskById(0);
      expect(task.reward).to.equal(depositAmount);
    });

    it("Should complete the task", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      await taskManager.connect(owner).updateTaskStatus(0, 2);
      await taskManager.connect(owner).completeTask(0);
      const task = await taskManager.connect(owner).getTaskById(0);
      expect(task.reward).to.equal(0);
      expect(task.status).to.equal(STATUS_DONE);
    });

    it("Should get the task list", async function () {
      const taskList = [{
          id: 0,
          title: taskTitle1,
          description: taskDescription1,
          assignee: assignee.address,
          reward: 0,
          status: STATUS_BACKLOG 
        }, 
        {
          id: 1,
          title: taskTitle2,
          description: taskDescription2,
          assignee: ethers.constants.AddressZero,
          reward: 0,
          status: STATUS_BACKLOG
        }]
      const tasks = await taskManager.connect(owner).getAllTasks();
      const normalizedTasks = tasks.map(task => ({
        id: task.id.toNumber(),
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        reward: task.reward.toNumber(),
        status: task.status
      }));
      expect(normalizedTasks).to.deep.equal(taskList);
    });
  });

  describe("Functions negative tests", function () {

    it("Set assigne should reject when assignee already set", async function () {
      expect(
        taskManager.connect(owner).setAssignee(0, maintainer.address)
      ).to.be.rejectedWith("Assignee already set");
    });

    it("Set assigne should reject when assignee not existing", async function () {
      userManagerMock.hasUser.returns(false);
      expect(
        taskManager.connect(owner).setAssignee(1, none.address)
      ).to.be.rejectedWith("User must be added to the project first");
    });

    it("Update task status should reject when the assignee is not set", async function () {
      expect(
        taskManager.connect(owner).updateTaskStatus(1, STATUS_IN_PROGRESS)
      ).to.be.rejectedWith("Cannot update status of a task without an assignee");
    });

    it("Update task status should reject when trying to complete task with update status function", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      await taskManager.connect(owner).updateTaskStatus(0, 2);
      expect(
        taskManager.connect(owner).updateTaskStatus(0, STATUS_DONE)
      ).to.be.rejectedWith("Cannot set status to Done using this function");
    });

    it("Update task status should reject when trying to change the status of completed task", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      await taskManager.connect(owner).updateTaskStatus(0, 2);
      await taskManager.connect(owner).completeTask(0);
      expect(
        taskManager.connect(owner).updateTaskStatus(0, STATUS_IN_PROGRESS)
      ).to.be.rejectedWith("Cannot update status of a completed task");
    });

    it("Deposit ETH should reject when trying to run it on completed task", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      await taskManager.connect(owner).updateTaskStatus(0, 2);
      await taskManager.connect(owner).completeTask(0);
      expect(
        taskManager.connect(owner).depositETH(0, { value: depositAmount })
      ).to.be.rejectedWith("Cannot deposit ETH to a completed task");
    });

    it("Complete task should reject when the task has no reward", async function () {
      await taskManager.connect(owner).updateTaskStatus(0, 2);
      expect(
        taskManager.connect(owner).completeTask(0)
      ).to.be.rejectedWith("No reward available for this task");
    });

    it("Complete task should reject when in backlog state", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      expect(
        taskManager.connect(owner).completeTask(0)
      ).to.be.rejectedWith("Task must be in Validation status to complete");
    });

    it("Complete task should reject when in in-progress state", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001");
      await taskManager.connect(owner).depositETH(0, { value: depositAmount });
      await taskManager.connect(owner).updateTaskStatus(0, 1);
      expect(
        taskManager.connect(owner).completeTask(0)
      ).to.be.rejectedWith("Task must be in Validation status to complete");
    });

  });
});
