/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
const { expect } = require('chai');

describe("testament", () => {
  let dev, doctor, owner, alice, Testament, testament;

  beforeEach(async function () {
    [dev, doctor, owner, alice] = await ethers.getSigners();
    Testament = await ethers.getContractFactory('Testament');
    testament = await Testament.connect(dev).deploy(owner.address, doctor.address);
    await testament.deployed();
  });

  describe('Deployment', function () {
    it("revert if the owner and doctor is the same person", async function () {
      const Testament2 = await ethers.getContractFactory('Testament');
      await expect(Testament2.connect(dev).deploy(owner.address, owner.address))
        .to.revertedWith("Testament: You cannot define the owner and the doctor as the same person.");
    });

    it('should assign the owner and the doctor', async function () {
      expect(await testament.doctor()).to.equal(doctor.address);
      expect(await testament.owner()).to.equal(owner.address);
    });
  });

  describe('bequeath', function () {
    it("revert if it's not the owner", async function () {
      await expect(testament.connect(doctor).bequeath(alice.address, { value: 1000 })).to
        .revertedWith("Testament: You are not allowed to use this function.");
    });

    it("should add value for his heir", async function () {
      await testament.connect(owner).bequeath(alice.address, { value: 1000 });
      expect(await testament.legacyOf(alice.address)).to.equal(1000);
    });

    it("emit event Bequeath", async function () {
      await expect(testament.connect(owner).bequeath(alice.address, { value: 1000 }))
        .to.emit(testament, 'Bequeath')
        .withArgs(alice.address, 1000);
    });
  });

  describe("setDoctor", function () {
    it("revert if it's not the oowner", async function () {
      expect(testament.connect(doctor).setDoctor(alice.address)).to
        .revertedWith("Testament: You are not allowed to use this function.");
    });

    it("revert if the owner try to set himself as doctor", async function () {
      expect(testament.connect(owner).setDoctor(owner.address))
        .to.revertedWith("Testament: You cannot be set as doctor.");
    });

    it("should set a new doctor", async function () {
      await testament.connect(owner).setDoctor(alice.address);
      expect(await testament.doctor()).to.equal(alice.address);
    });

    it("emit event DoctorChanged", async function () {
      await expect(testament.connect(owner).setDoctor(alice.address))
        .to.emit(testament, 'DoctorChanged')
        .withArgs(alice.address);
    });
  });

  describe("contractEnd", function () {
    it("revert if it's not the doctor", async function () {
      await expect(testament.connect(owner).contractEnd()).to
        .revertedWith("Testament: You are not allowed to use this function.");
    });

    it("revert if contract is already over", async function () {
      await testament.connect(doctor).contractEnd();
      await expect(testament.connect(doctor).contractEnd())
        .to.revertedWith("Testament: The contract is already over.");
    });

    it("should change the state of '_contractEnd' to true", async function () {
      await testament.connect(doctor).contractEnd();
      expect(await testament.isContractOver()).to.equal(true);
    });

    it("emit event ContractEnded", async function () {
      await expect(testament.connect(doctor).contractEnd())
        .to.emit(testament, 'ContractEnded')
        .withArgs(doctor.address);
    });
  });

  describe("withdraw", function () {
    it("revert if the contract is not over yet", async function () {
      await testament.connect(owner).bequeath(alice.address, { value: 1000 });
      await expect(testament.connect(alice).withdraw()).to
        .revertedWith("Testament: The contract has not yet over.");
    });

    it("revert if the msg.sender is not the heir", async function () {
      await testament.connect(doctor).contractEnd();
      await expect(testament.connect(alice).withdraw())
        .to.revertedWith("Testament: You do not have any legacy on this contract.");
    });

    it("should send the money to the heir and empty the _legacy balance", async function () {
      await testament.connect(owner).bequeath(alice.address, { value: 1000 });
      await testament.connect(doctor).contractEnd();
      //await testament.connect(alice).withdraw();
      await expect(() => testament.connect(alice).withdraw())
        .to.changeEtherBalance(alice, 1000);
      expect(await testament.legacyOf(alice.address)).to.equal(0);
    });

    it("emit event LegacyWithdrew", async function () {
      await testament.connect(owner).bequeath(alice.address, { value: 1000 });
      await testament.connect(doctor).contractEnd();
      await expect(testament.connect(alice).withdraw())
        .to.emit(testament, 'LegacyWithdrew')
        .withArgs(alice.address, 1000);
    });
  });
});
