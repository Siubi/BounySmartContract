import { expect } from "chai";

describe("UserManager - functions", function () {
    let userManager;
    let owner, maintainer, assignee, viewer, none;
    let ownerConnection, maintainerConnection, assigneeConnection;
    let allUsers;
    const ROLE_VIEWER = 1;
    const ROLE_ASSIGNEE = 2;
    const ROLE_MAINTAINER = 3;

    const invalidAddresses = [
      "0x0000000000000000000000000000000000000000", // 0s
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

      
      const allSigners = await ethers.getSigners();
      [owner, maintainer, assignee, viewer, none] = allSigners;
      allUsers = [maintainer, assignee, viewer, none];
  
      ownerConnection = userManager.connect(owner);
      maintainerConnection = userManager.connect(maintainer);
      assigneeConnection = userManager.connect(assignee);

      await ownerConnection.addUser(maintainer.address, ROLE_MAINTAINER);
      await ownerConnection.addUser(assignee.address, ROLE_ASSIGNEE);
      await ownerConnection.addUser(viewer.address, ROLE_VIEWER);
    });

  describe("Functions positive tests", function () {

    it("New user should be added to the list", async function () {
      await maintainerConnection.addUser(none.address, ROLE_VIEWER)

      const user = await userManager.connect(maintainer).getUser(none.address);
      expect(user[0]).to.equal(none.address);
      expect(user[1]).to.equal(ROLE_VIEWER);
    });

    it("User should be removed from the list", async function () {
      await maintainerConnection.removeUser(viewer.address)
      await expect(
        maintainerConnection.getUser(viewer.address)
      ).to.be.rejectedWith("User with given address is not added");
    });

    it("Every user should be able to get all users", async function () {
      const expectedResult = [
        [maintainer.address, ROLE_MAINTAINER, ""],
        [assignee.address, ROLE_ASSIGNEE, ""],
        [viewer.address, ROLE_VIEWER, ""]
      ]
      for (const [index, user] of allUsers.entries()) {
        const retUsers = await userManager.connect(user).getAllUsers();
        expect(retUsers).to.deep.equal(expectedResult);
      }
    });

    it("Every user should be able to get specific user", async function () {
      const expectedResult = [viewer.address, ROLE_VIEWER, ""]
      for (const [index, user] of allUsers.entries()) {
        const retUser = await userManager.connect(user).getUser(viewer.address);
        expect(retUser).to.deep.equal(expectedResult);
      }
    });

    it("Every user should be able to get the role of specific user", async function () {
      for (const [index, user] of allUsers.entries()) {
        const retRole = await userManager.connect(user).getRole(viewer.address);
        expect(retRole).to.deep.equal(ROLE_VIEWER);
      }
    });

    it("Every user should be able to check if the user with given address exists (true)", async function () {
      for (const [index, user] of allUsers.entries()) {
        const ret = await userManager.connect(user).hasUser(viewer.address);
        expect(ret).to.deep.equal(true);
      }
    });

    it("Every user should be able to check if the user with given address exists (false)", async function () {
      for (const [index, user] of allUsers.entries()) {
        const ret = await userManager.connect(user).hasUser(none.address);
        expect(ret).to.deep.equal(false);
      }
    });
  });

  describe("Functions negative tests", function () {

    it("Should not accept invalid address - changeRole", async function () {
      for (const [index, address] of invalidAddresses.entries()) {
        expect(
          maintainerConnection.changeRole(address, ROLE_VIEWER)
        ).to.be.rejectedWith("Invalid address");
      }
    });

    it("Should not accept undefined role ", async function () {
      const invalidRoles = [-1, 4, 20];
      for (const [index, role] of invalidRoles.entries()) {
        expect(
          maintainerConnection.changeRole(viewer.address, role)
        ).to.be.rejectedWith("Can't setup role as None");
      }
    });

    it("Should not accept uninitialized address - changeRole", async function () {
      const unknownAddress = 0xdAC6815b15482c0f2e66756E8f5705186cf12262;
      expect(
        maintainerConnection.changeRole(unknownAddress, ROLE_VIEWER)
      ).to.be.rejectedWith("User must be added first");
    });

    it("Should not accept invalid address - getUser", async function () {
      for (const [index, address] of invalidAddresses.entries()) {
        expect(
          maintainerConnection.getUser(address)
        ).to.be.rejectedWith("Invalid address");
      }
    });

    it("Should not accept uninitialized address - getUser", async function () {
      const unknownAddress = 0xdAC6815b15482c0f2e66756E8f5705186cf12262;
      expect(
        maintainerConnection.getUser(unknownAddress)
      ).to.be.rejectedWith("User with given address is not added");
    });


    it("Should not accept adding user if already exists", async function () {
      expect(
        maintainerConnection.addUser(viewer.address, ROLE_VIEWER)
      ).to.be.rejectedWith("User is already added");
    });

    it("Should not accept removig user if doesn't exist", async function () {
      expect(
        maintainerConnection.removeUser(none.address)
      ).to.be.rejectedWith("User does not exist");
    });

    it("Should not accept changing the username if given empty string", async function () {
      expect(
        maintainerConnection.setUsername("")
      ).to.be.rejectedWith("Username cannot be empty");
    });

    it("Should not accept changing the username if user is not added", async function () {
      expect(
        userManager.connect(none).setUsername("")
      ).to.be.rejectedWith("User must be added first");
    });
  });
});
