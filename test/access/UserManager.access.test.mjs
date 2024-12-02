import { expect, use } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

describe("UserManager - Access Control", function () {
  let userManager;
  let owner, maintainer, assignee, viewer, none;
  let ownerConnection, maintainerConnection;
  const ROLE_VIEWER = 1;
  const ROLE_MAINTAINER = 3;

  beforeEach(async function () {
    // Deploy the contract
    const UserManager = await ethers.getContractFactory("UserManager");
    userManager = await UserManager.deploy();
    await userManager.deployed();

    // Get signers
    [owner, maintainer, assignee, viewer, none] = await ethers.getSigners();

    ownerConnection = userManager.connect(owner);
    await ownerConnection.addUser(maintainer.address, ROLE_MAINTAINER);
    maintainerConnection = userManager.connect(maintainer);
  });

  describe("Add the user to list", function () {
    it("Should allow owner to add the new user to the list", async function () {
      await expect(
        ownerConnection.addUser(viewer.address, ROLE_VIEWER)
      ).to.be.fulfilled;
    });
  
    it("Should allow maintainer to add the new user to the list", async function () {
      await expect(
        maintainerConnection.addUser(viewer.address, ROLE_VIEWER)
      ).to.be.fulfilled;
    });

    it("Should revert if a assignee tries to add a user", async function () {
        await expect(
          userManager.connect(assignee).addUser(none.address, ROLE_VIEWER)
        ).to.be.rejectedWith("Access denied: insufficient permissions");
    });

    it("Should revert if a viewer tries to add a user", async function () {
      await expect(
        userManager.connect(viewer).addUser(none.address, ROLE_VIEWER)
      ).to.be.rejectedWith("Access denied: insufficient permissions");
    });

    it("Should revert if a none tries to add a user", async function () {
      await expect(
        userManager.connect(none).addUser(none.address, ROLE_VIEWER)
      ).to.be.rejectedWith("Access denied: insufficient permissions");
    });
  });

  describe("Remove the user from the list", function () {
    it("Should allow owner to remove the new user from the list", async function () {
      await ownerConnection.addUser(viewer.address, ROLE_VIEWER)
      await expect(
        ownerConnection.removeUser(viewer.address)
      ).to.be.fulfilled;
    });

    it("Should allow maintainer to remove the new user from the list", async function () {
      await maintainerConnection.addUser(viewer.address, ROLE_VIEWER)
      await maintainerConnection.removeUser(viewer.address)
      await expect(
        maintainerConnection.getUser(none.address)
      ).to.be.rejectedWith("User with given address is not added");
    });

    it("Should revert if a assignee tries to remove the user", async function () {
      await maintainerConnection.addUser(viewer.address, ROLE_VIEWER)
      await expect(
        userManager.connect(assignee).removeUser(viewer.address)
      ).to.be.rejectedWith("Access denied: insufficient permissions");
    });

    it("Should revert if a viewer tries to remove the user", async function () {
      await maintainerConnection.addUser(viewer.address, ROLE_VIEWER)
      await expect(
        userManager.connect(viewer).removeUser(viewer.address)
      ).to.be.rejectedWith("Access denied: insufficient permissions");
    });

    it("Should revert if a none tries to remove the user", async function () {
      await maintainerConnection.addUser(viewer.address, ROLE_VIEWER)
      await expect(
        userManager.connect(none).removeUser(viewer.address)
      ).to.be.rejectedWith("Access denied: insufficient permissions");
    });
  });
});
