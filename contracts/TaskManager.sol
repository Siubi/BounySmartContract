// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserManager.sol";

contract TaskManager {

    enum TaskStatus { Backlog, InProgress, Validation, Done }

    struct Task {
        uint256 id;
        string title;
        string description;
        address assignee;
        uint256 reward;
        TaskStatus status;
    }

    uint256 private nextTaskId;
    mapping(uint256 => Task) private tasks;
    uint256[] private taskIds;
    address private owner;

    UserManager private userManager;

    event TaskCreated(uint256 indexed id, string title, string description);
    event TaskStatusUpdated(uint256 indexed id, TaskStatus newStatus);
    event TaskCompleted(uint256 indexed id, address assignee);
    event ETHDeposited(uint256 indexed taskId, uint256 amount);
    event MaintainerAdded(address indexed newMaintainer);
    event AssigneeSet(uint256 indexed taskId, address indexed assignee);

    constructor(address userManagerAddress) {
        owner = msg.sender;
        userManager = UserManager(userManagerAddress);
    }

    modifier onlyRole(UserManager.Role requiredRole) {
        require(
            uint256(userManager.getRole(msg.sender)) >= uint256(requiredRole) || owner == msg.sender,
            "Access denied: insufficient permissions"
        );
        _;
    }

    function createTask(string memory _title, string memory _description) public onlyRole(UserManager.Role.Maintainer) {
        tasks[nextTaskId] = Task({
            id: nextTaskId,
            title: _title,
            description: _description,
            assignee: address(0),
            reward: 0,
            status: TaskStatus.Backlog
        });
        taskIds.push(nextTaskId);
        
        emit TaskCreated(nextTaskId, _title, _description);
        
        nextTaskId++;
    }

    function setAssignee(uint256 taskId, address _assignee) public onlyRole(UserManager.Role.Maintainer) {
        require(tasks[taskId].assignee == address(0), "Assignee already set");
        require(userManager.hasUser(_assignee), "User must be added to the project first");
        
        tasks[taskId].assignee = _assignee;
        
        emit AssigneeSet(taskId, _assignee);
    }

    function updateTaskStatus(uint256 taskId, TaskStatus newStatus) public onlyRole(UserManager.Role.Maintainer) {
        require(tasks[taskId].assignee != address(0), "Cannot update status of a task without an assignee");
        require(tasks[taskId].status != TaskStatus.Done, "Cannot update status of a completed task");
        require(newStatus != TaskStatus.Done, "Cannot set status to Done using this function");

        tasks[taskId].status = newStatus;
        
        emit TaskStatusUpdated(taskId, newStatus);
    }

    function depositETH(uint256 taskId) public payable onlyRole(UserManager.Role.Maintainer) {
        require(tasks[taskId].status != TaskStatus.Done, "Cannot deposit ETH to a completed task");
        
        tasks[taskId].reward += msg.value;
        
        emit ETHDeposited(taskId, msg.value);
    }

    function completeTask(uint256 taskId) public onlyRole(UserManager.Role.Maintainer) {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Validation, "Task must be in Validation status to complete");
        require(task.reward > 0, "No reward available for this task");
        require(task.assignee != address(0), "Task must have an assignee");

        uint256 rewardAmount = task.reward;
        (bool success, ) = task.assignee.call{value: rewardAmount}("");

        if (success) {
            task.reward = 0;
            task.status = TaskStatus.Done;
            
            emit TaskCompleted(taskId, task.assignee);
        } else {
            revert("Reward transfer failed");
        }
    }

    function getAllTaskIds() public view returns (uint256[] memory) {
        return taskIds;
    }

    function getTaskById(uint256 taskId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        address assignee,
        uint256 reward,
        TaskStatus status
    ) {
        Task storage task = tasks[taskId];
        return (
            task.id,
            task.title,
            task.description,
            task.assignee,
            task.reward,
            task.status
        );
    }

    function getAllTasks() public view returns (Task[] memory) {
        Task[] memory allTasks = new Task[](taskIds.length);
        for (uint256 i = 0; i < taskIds.length; i++) {
            allTasks[i] = tasks[taskIds[i]];
        }
        
        return allTasks;
    }
}