/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
const { expect } = require('chai');

describe("sarahRo", () => {
  let dev, owner, alice, ICO, ico, SRO, sarahRo;

  beforeEach(async function () {
    [dev, doctor, owner, alice, ICO, ico, SRO, sarahRo] = await ethers.getSigners();
    SRO = await ethers.getContractFactory('SarahRo');
    sarahRo = await SRO.connect(dev).deploy();
    await sarahRo.deployed();
  });

  describe('Deployment sarahRo token', function () {
    it("should make msg.sender the owner of this contract", async function () {
      const SRO2 = await ethers.getContractFactory('SarahRo');
      sarahRo = await SRO2.connect(dev).deploy();
      await sarahRo.deployed();
      expect(await sarahRo.connect(dev).owner()).to.equal(dev.address)
    });

    it('should have a total supply of 1.000.000 tokens', async function () {
      expect(await sarahRo.totalSupply()).to.equal(ethers.utils.parseEther('1000000'))
    });

    it('should send 1.000.000 tokens to the owner of the contract', async function () {
      const SRO2 = await ethers.getContractFactory('SarahRo');
      sarahRo = await SRO2.connect(dev).deploy();
      await sarahRo.deployed();
      expect(await sarahRo.balanceOf(dev.address)).to.equal(ethers.utils.parseEther('1000000'))
    });

    it("should have name of sarahRo ", async function () {
      expect(await sarahRo.name()).to.equal("SarahRo")
    });

    it("should have symbol of SRO", async function () {
      expect(await sarahRo.symbol()).to.equal("SRO")
      console.log("      ✔ Yes ! A true standart of ERC20 😎")
    });
    
  });

  // describe('bequeath', function () {
  //   it("revert if it's not the owner", async function () {
  //     await expect(testament.connect(doctor).bequeath(alice.address, { value: 1000 })).to
  //       .revertedWith("Testament: You are not allowed to use this function.");
  //   });

  //   it("should add value for his heir", async function () {
  //     await testament.connect(owner).bequeath(alice.address, { value: 1000 });
  //     expect(await testament.legacyOf(alice.address)).to.equal(1000);
  //   });

  //   it("emit event Bequeath", async function () {
  //     await expect(testament.connect(owner).bequeath(alice.address, { value: 1000 }))
  //       .to.emit(testament, 'Bequeath')
  //       .withArgs(alice.address, 1000);
  //   });
  // });

  // describe("setDoctor", function () {
  //   it("revert if it's not the oowner", async function () {
  //     expect(testament.connect(doctor).setDoctor(alice.address)).to
  //       .revertedWith("Testament: You are not allowed to use this function.");
  //   });

  //   it("revert if the owner try to set himself as doctor", async function () {
  //     expect(testament.connect(owner).setDoctor(owner.address))
  //       .to.revertedWith("Testament: You cannot be set as doctor.");
  //   });

  //   it("should set a new doctor", async function () {
  //     await testament.connect(owner).setDoctor(alice.address);
  //     expect(await testament.doctor()).to.equal(alice.address);
  //   });

  //   it("emit event DoctorChanged", async function () {
  //     await expect(testament.connect(owner).setDoctor(alice.address))
  //       .to.emit(testament, 'DoctorChanged')
  //       .withArgs(alice.address);
  //   });
  // });

  // describe("contractEnd", function () {
  //   it("revert if it's not the doctor", async function () {
  //     await expect(testament.connect(owner).contractEnd()).to
  //       .revertedWith("Testament: You are not allowed to use this function.");
  //   });

  //   it("revert if contract is already over", async function () {
  //     await testament.connect(doctor).contractEnd();
  //     await expect(testament.connect(doctor).contractEnd())
  //       .to.revertedWith("Testament: The contract is already over.");
  //   });

  //   it("should change the state of '_contractEnd' to true", async function () {
  //     await testament.connect(doctor).contractEnd();
  //     expect(await testament.isContractOver()).to.equal(true);
  //   });

  //   it("emit event ContractEnded", async function () {
  //     await expect(testament.connect(doctor).contractEnd())
  //       .to.emit(testament, 'ContractEnded')
  //       .withArgs(doctor.address);
  //   });
  // });

  // describe("withdraw", function () {
  //   it("revert if the contract is not over yet", async function () {
  //     await testament.connect(owner).bequeath(alice.address, { value: 1000 });
  //     await expect(testament.connect(alice).withdraw()).to
  //       .revertedWith("Testament: The contract has not yet over.");
  //   });

  //   it("revert if the msg.sender is not the heir", async function () {
  //     await testament.connect(doctor).contractEnd();
  //     await expect(testament.connect(alice).withdraw())
  //       .to.revertedWith("Testament: You do not have any legacy on this contract.");
  //   });

  //   it("should send the money to the heir and empty the _legacy balance", async function () {
  //     await testament.connect(owner).bequeath(alice.address, { value: 1000 });
  //     await testament.connect(doctor).contractEnd();
  //     //await testament.connect(alice).withdraw();
  //     await expect(() => testament.connect(alice).withdraw())
  //       .to.changeEtherBalance(alice, 1000);
  //     expect(await testament.legacyOf(alice.address)).to.equal(0);
  //   });

  //   it("emit event LegacyWithdrew", async function () {
  //     await testament.connect(owner).bequeath(alice.address, { value: 1000 });
  //     await testament.connect(doctor).contractEnd();
  //     await expect(testament.connect(alice).withdraw())
  //       .to.emit(testament, 'LegacyWithdrew')
  //       .withArgs(alice.address, 1000);
  //   });
  // });
});
