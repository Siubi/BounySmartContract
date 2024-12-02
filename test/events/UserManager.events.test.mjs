import { expect } from "chai";

describe("UserManager - Events", function () {
    let userManager;
    let owner, maintainer, assignee, viewer, none;
    let ownerConnection, maintainerConnection, assigneeConnection;
    const ROLE_VIEWER = 1;
    const ROLE_ASSIGNEE = 2;
    const ROLE_MAINTAINER = 3;

    const invalidAddresses = [
      "0x12345", // Too short
      "0x1234567890abcdef1234567890abcdef1234567890abcdef", // Too long
      "0x1234567890ABCDEF1234567890GHIJKLMNOPQRSTUVWX", // Invalid characters
      "1234567890abcdef1234567890abcdef12345678", // Missing 0x prefix
      "0x", // Empty address
      "0x1234567890abcdef1234567890abcdef1234567g" // Non-hex character
    ];

    beforeEach(async function () {
      const UserManager = await ethers.getContractFactory("UserManager");
      userManager = await UserManager.deploy();
      await userManager.deployed();

      [owner, maintainer, assignee, viewer, none] = await ethers.getSigners();
      ownerConnection = userManager.connect(owner);
      maintainerConnection = userManager.connect(maintainer);
      assigneeConnection = userManager.connect(assignee);

      await ownerConnection.addUser(maintainer.address, ROLE_MAINTAINER);
      await ownerConnection.addUser(assignee.address, ROLE_ASSIGNEE);
    });

  describe("Event positive tests", function () {

    it("Should emit RoleChanged event when a role is changed", async function () {
      expect(maintainerConnection.changeRole(assignee.address, ROLE_VIEWER))
      .to.emit(userManager, "RoleChanged")
      .withArgs(assignee.address, ROLE_VIEWER);
    });

    it("Should emit UsernameUpdated event when a username is set", async function () {
      const USERNAME = "Username";

      expect(maintainerConnection.setUsername(USERNAME))
      .to.emit(userManager, "UsernameUpdated")
      .withArgs(maintainer.address, USERNAME);
    });

    it("Should emit UserAdded event when a user is added", async function () {
      expect(maintainerConnection.addUser(viewer.address, ROLE_VIEWER))
      .to.emit(userManager, "UserAdded")
      .withArgs(viewer.address);
    });

    it("Should emit UserRemoved event when a user is removed", async function () {
      expect(maintainerConnection.removeUser(assignee.address))
      .to.emit(userManager, "UserRemoved")
      .withArgs(assignee.address);
    });
  });

  describe("Event negative tests", function () {

    it("Should not emit RoleChanged event when a new role is out of range", async function () {
      const ROLE_UNDEFINED = 10;

      expect(maintainerConnection.changeRole(assignee.address, ROLE_UNDEFINED))
      .to.not.emit(userManager, "RoleChanged");
    });

    it("Should not emit RoleChanged event when an address is wrong", async function () {
      for (const [index, address] of invalidAddresses.entries()) {
        expect(maintainerConnection.changeRole(address, ROLE_VIEWER))
        .to.not.emit(userManager, "RoleChanged");
      }
    });

    it("Should not emit RoleChanged event when an address is not added", async function () {
      expect(maintainerConnection.changeRole(none.address, ROLE_VIEWER))
      .to.not.emit(userManager, "RoleChanged");
    });

    it("Should not emit UsernameUpdated event when an address is not added", async function () {
      const USERNAME = "Username";
      expect(userManager.connect(none).setUsername(USERNAME))
      .to.not.emit(userManager, "UsernameUpdated");
    });

    it("Should not emit UsernameUpdated event when username is empty", async function () {
      const USERNAME = "";
      expect(maintainerConnection.setUsername(USERNAME))
      .to.not.emit(userManager, "UsernameUpdated");
    });

    it("Should not emit UserAdded event when user is already added", async function () {
      expect(maintainerConnection.addUser(assignee.address, ROLE_VIEWER))
      .to.not.emit(userManager, "UserAdded");
    });

    it("Should not emit UserRemoved event when user is not added", async function () {
      expect(maintainerConnection.removeUser(none.address, ROLE_VIEWER))
      .to.not.emit(userManager, "UserRemoved");
    });
  });
});
