/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
const { expect } = require('chai');


describe("sarahRo", () => {
  let owner, alice, SRO, sarahRo;

  beforeEach(async function () {
    [owner, alice, SRO, sarahRo] = await ethers.getSigners();
    SRO = await ethers.getContractFactory('SarahRo');
    sarahRo = await SRO.connect(owner).deploy();
    await sarahRo.deployed();
  });

  describe('Deployment sarahRo token', function () {
    it("should make msg.sender the owner of this contract", async function () {
      expect(await sarahRo.connect(owner).owner()).to.equal(owner.address)
    });

    it('should have a total supply of 1.000.000.000 tokens', async function () {
      expect(await sarahRo.totalSupply()).to.equal(ethers.utils.parseEther('1000000000'))
    });

    it('should send 1.000.000.000 tokens to the owner of the contract', async function () {
      const SRO2 = await ethers.getContractFactory('SarahRo');
      sarahRo = await SRO2.connect(owner).deploy();
      await sarahRo.deployed();
      expect(await sarahRo.balanceOf(owner.address)).to.equal(ethers.utils.parseEther('1000000000'))
    });

    it("should have name of sarahRo ", async function () {
      expect(await sarahRo.name()).to.equal("SarahRo")
    });

    it("should have symbol of SRO", async function () {
      expect(await sarahRo.symbol()).to.equal("SRO")
      console.log("      ✔ Yes ! A true standart of ERC20 😎")
    });
  });

  

 

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

describe('ICO', () => {
    let SRO, sarahRo, ICO, ico, owner, alice, bob;

    beforeEach(async function () {
    [SRO, sarahRo, ICO, ico, owner, alice, bob] = await ethers.getSigners();

    SRO = await ethers.getContractFactory('SarahRo');
    sarahRo = await SRO.connect(owner).deploy();
    await sarahRo.deployed();

    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(owner).deploy(sarahRo.address, 1e9, ethers.utils.parseEther('500000000'));
    await ico.deployed();
    });
     
    describe('Deployment ICO', function () {
      it("Should revert if its not deployed by the owner of SarahRo", async function () {
        await expect(ICO.connect(alice).deploy(sarahRo.address, 1e9, 500)).to.revertedWith("ICO: only the owner of the SRO can deploy this ICO")
      });

      it("Should has start counting time until the end of the ICO", async function () {
        await ethers.provider.send('evm_increaseTime', [10]);
        await ethers.provider.send('evm_mine');
        expect(await ico.secondeRemaining()).to.equal(1209590);
      })

      it("Should has a rate as given when owner deployed the contract", async function () {
       expect(await ico.connect(owner).rate()).to.equal(1e9);
      })

      it("Should be allowed to sell an amount of SRO equal to the amount given in parameter to the constructor", async function () {
        expect(await ico.supplyICORemaining()).to.equal(ethers.utils.parseEther('500000000'));
      });

      it("Should emit an event 'Approval' after deploying the ICO", async function () {
        let receipt = await ico.deployTransaction.wait()
        let txHash = receipt.transactionHash
        await expect(txHash)
          .to.emit(sarahRo, 'Approval')
          .withArgs(owner.address, ico.address, ethers.utils.parseEther('500000000'))
        });
    });

    describe('receive() & function buyTokens()', function () {
      it("Should revert if the ICO is finish", async function () {
        await ethers.provider.send('evm_increaseTime', [1209600]);
        await ethers.provider.send('evm_mine');
        await expect(alice.sendTransaction({value: (await ethers.utils.parseEther('10')), to: ico.address})).to.revertedWith("ICO: Sorry this ico is already finnish go FOMO market buy on exchange");
      });

      it("Should give the change to the balance of msg.sender depending of the exchange rate between SRO and ETH tokens", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.000000001')), to: ico.address});
        expect(await ico.connect(alice).balanceOf(alice.address)).to.equal(await ethers.utils.parseEther('1'));
      });

      it("Should revert if the amount sent exceed the remaining balance of this ICO", async function () {
        await expect(alice.sendTransaction({value: (await ethers.utils.parseEther('10')), to: ico.address})).to.revertedWith("SarahRo: there is not enought SRO remaining for your demand");
      });

      it("Should decrease the supply total remaining", async function () {
        expect(await ico.supplyICORemaining()).to.equal(ethers.utils.parseEther('500000000'));
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address});
        expect(await ico.supplyICORemaining()).to.equal(ethers.utils.parseEther('400000000'));
      });

      it("Should emit event 'Bought'", async function () {
        await expect(alice.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address}))
          .to.emit(ico, 'Bought')
          .withArgs(alice.address, (await ethers.utils.parseEther('100000000')));
      });
    });

    describe('function withdrawBalance()', function () {
      it("Should revert if its not called by owner", async function () {
        await ethers.provider.send('evm_increaseTime', [1300000]);
        await ethers.provider.send('evm_mine');
        await expect(ico.connect(alice).withdrawBalance()).to.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert if the ICO isnt finish yet", async function () {
        await ethers.provider.send('evm_increaseTime', [1200000]);
        await ethers.provider.send('evm_mine');
        await expect(ico.connect(owner).withdrawBalance()).to.revertedWith("ICO: Sorry this ico is still running, wait the end");
      });

      it("Should revert if the balance is empty", async function () {
        await ethers.provider.send('evm_increaseTime', [1300000]);
        await ethers.provider.send('evm_mine');
        await expect(ico.connect(owner).withdrawBalance()).to.revertedWith("ICO: cannot withdraw 0 ether");
      });

      it("Should withdraw all the balance", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        await ico.connect(bob).buyTokens({value: (await ethers.utils.parseEther('0.015'))})
        await bob.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address})
        await ethers.provider.send('evm_increaseTime', [1300000]);
        await ethers.provider.send('evm_mine');
        await expect(() => ico.connect(owner).withdrawBalance())
          .to.changeEtherBalance(owner, (await ethers.utils.parseEther('0.315')));
      
      });

      it("Should emit event 'Withdrew'", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        await ico.connect(bob).buyTokens({value: (await ethers.utils.parseEther('0.015'))})
        await bob.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address})
        await ethers.provider.send('evm_increaseTime', [1300000]);
        await ethers.provider.send('evm_mine');
        await expect(ico.connect(owner).withdrawBalance())
          .to.emit(ico, "Withdrew")
          .withArgs(ico.address, (await ethers.utils.parseEther('0.315')));
      });
    });

});
