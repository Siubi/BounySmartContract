// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserManager {

    enum Role { None, Viewer, Assignee, Maintainer }

    struct User {
        address userAddress;
        Role role;
        string username;
    }

    address private owner;
    mapping(address => User) private users;
    mapping(address => bool) private initializedUsers;
    address[] private userAddresses;

    event RoleChanged(address indexed user, Role newRole);
    event UsernameUpdated(address indexed user, string username);
    event UserAdded(address indexed user);
    event UserRemoved(address indexed user);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyRole(Role requiredRole) {
        require(
            uint256(users[msg.sender].role) >= uint256(requiredRole) || owner == msg.sender,
            "Access denied: insufficient permissions"
        );
        _;
    }

    function addUser(address userAddress, Role role) public onlyRole(Role.Maintainer) {

        require(!initializedUsers[userAddress], "User is already added");

        users[userAddress] = User(userAddress, role, "");
        userAddresses.push(userAddress);
        initializedUsers[userAddress] = true;

        emit UserAdded(userAddress);
    }

    function removeUser(address userAddress) public onlyRole(Role.Maintainer) {
        require(initializedUsers[userAddress], "User does not exist");

        delete users[userAddress];
        initializedUsers[userAddress] = false;

        for (uint256 i = 0; i < userAddresses.length; i++) {
            if (userAddresses[i] == userAddress) {
                userAddresses[i] = userAddresses[userAddresses.length - 1];
                userAddresses.pop();
                break;
            }
        }

        emit UserRemoved(userAddress);
    }

    function changeRole(address userAddress, Role newRole) public onlyRole(Role.Maintainer) {
        require(userAddress != address(0), "Invalid address");
        require(newRole >= Role.None && newRole <= Role.Maintainer, "Can't setup role as None");
        require(initializedUsers[userAddress], "User must be added first");

        users[userAddress].role = newRole;

        emit RoleChanged(userAddress, newRole);
    }

    function setUsername(string memory username) public {
        require(bytes(username).length > 0, "Username cannot be empty");
        require(initializedUsers[msg.sender], "User must be added first");

        users[msg.sender].username = username;

        emit UsernameUpdated(msg.sender, username);
    }

    function getUser(address userAddress) public view returns (User memory) {
        require(userAddress != address(0), "Invalid address");
        require(initializedUsers[userAddress], "User with given address is not added");

        return users[userAddress];
    }

    function getAllUsers() public view returns (User[] memory) {
        User[] memory allUsers = new User[](userAddresses.length);
        for (uint256 i = 0; i < userAddresses.length; i++) {
            allUsers[i] = users[userAddresses[i]];
        }

        return allUsers;
    }

    function getRole(address userAddress) public view returns (Role) {
        return users[userAddress].role;
    }

    function hasUser(address user) public view returns (bool) {
        return initializedUsers[user];
    }
}