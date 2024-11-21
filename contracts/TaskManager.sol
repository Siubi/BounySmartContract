// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaskManager {
    enum TaskStatus { Backlog, InProgress, Validation, Done }

    struct Task {
        uint256 id;
        string title;
        string description;
        address assignee; // Adres wykonawcy (portfel)
        uint256 reward; // Nagroda w ETH (przechowywana w wei)
        TaskStatus status;
    }

    uint256 private nextTaskId;
    mapping(uint256 => Task) private tasks;
    uint256[] private taskIds; // Tablica przechowująca ID wszystkich tasków
    address private owner;
    mapping(address => bool) private maintainers;

    event TaskCreated(uint256 indexed id, string title, string description);
    event TaskStatusUpdated(uint256 indexed id, TaskStatus newStatus);
    event TaskCompleted(uint256 indexed id, address assignee);
    event ETHDeposited(uint256 indexed taskId, uint256 amount);
    event MaintainerAdded(address indexed newMaintainer);
    event AssigneeSet(uint256 indexed taskId, address indexed assignee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyMaintainer() {
        require(msg.sender == owner || maintainers[msg.sender], "Only owner or maintainer can call this function");
        _;
    }

    modifier onlyAssignee(uint256 taskId) {
        require(tasks[taskId].assignee == msg.sender, "Only the assigned person can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Dodaje nowego maintainer'a
    function addMaintainer(address _maintainer) public onlyMaintainer {
        maintainers[_maintainer] = true;
        emit MaintainerAdded(_maintainer);
    }

    // Usuwa maintainer'a
    function removeMaintainer(address _maintainer) public onlyOwner {
        require(maintainers[_maintainer], "Address is not a maintainer");
        maintainers[_maintainer] = false;
    }

    // Tworzy nowy task bez assignee i bez początkowej nagrody
    function createTask(
        string memory _title,
        string memory _description
    ) public onlyMaintainer {
        tasks[nextTaskId] = Task({
            id: nextTaskId,
            title: _title,
            description: _description,
            assignee: address(0), // Brak przypisanego assignee na początku
            reward: 0, // Początkowa wartość nagrody wynosi 0
            status: TaskStatus.Backlog
        });
        taskIds.push(nextTaskId); // Dodaje ID taska do listy
        emit TaskCreated(nextTaskId, _title, _description);
        nextTaskId++;
    }

    // Ustawia assignee dla danego taska
    function setAssignee(uint256 taskId, address _assignee) public onlyMaintainer {
        require(tasks[taskId].assignee == address(0), "Assignee already set");
        tasks[taskId].assignee = _assignee;
        emit AssigneeSet(taskId, _assignee);
    }

    // Zmienia status taska
    function updateTaskStatus(uint256 taskId, TaskStatus newStatus) public onlyMaintainer {
        require(tasks[taskId].assignee != address(0), "Cannot update status of a task without an assignee");
        require(tasks[taskId].status != TaskStatus.Done, "Cannot update status of a completed task");
        require(newStatus != TaskStatus.Done, "Cannot set status to Done using this function");

        tasks[taskId].status = newStatus;
        emit TaskStatusUpdated(taskId, newStatus);
    }

    // Deponuje ETH na rzecz danego taska
    function depositETH(uint256 taskId) public payable onlyMaintainer {
        require(tasks[taskId].status != TaskStatus.Done, "Cannot deposit ETH to a completed task");
        tasks[taskId].reward += msg.value;
        emit ETHDeposited(taskId, msg.value);
    }

    // Oznacza task jako zakończony i wypłaca nagrodę
    function completeTask(uint256 taskId) public onlyMaintainer {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Validation, "Task must be in Validation status to complete");
        require(task.reward > 0, "No reward available for this task");
        require(task.assignee != address(0), "Task must have an assignee");

        // Przekazuje nagrodę do wykonawcy
        uint256 rewardAmount = task.reward;
        (bool success, ) = task.assignee.call{value: rewardAmount}("");

        if (success) {
            // Jeśli transfer się powiedzie, zerujemy nagrodę i zmieniamy status
            task.reward = 0;
            task.status = TaskStatus.Done;
            emit TaskCompleted(taskId, task.assignee);
        } else {
            // Jeśli transfer nie powiedzie się, pozostawiamy nagrodę nietkniętą
            revert("Reward transfer failed");
        }
    }

    // Pobiera listę ID wszystkich tasków
    function getAllTaskIds() public view returns (uint256[] memory) {
        return taskIds;
    }

    // Pobiera task na podstawie jego ID
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

    // Pobiera wszystkie taski
    function getAllTasks() public view returns (Task[] memory) {
        Task[] memory allTasks = new Task[](taskIds.length);
        for (uint256 i = 0; i < taskIds.length; i++) {
            allTasks[i] = tasks[taskIds[i]];
        }
        return allTasks;
    }
}