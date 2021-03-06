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

    it('should mint 1.000.000.000 tokens for the owner of the contract', async function () {
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
});




describe('ICO', () => {
    let SRO, sarahRo, ICO, ico, owner, alice, bob, charlie;

    beforeEach(async function () {
    [SRO, sarahRo, ICO, ico, owner, alice, bob, charlie] = await ethers.getSigners();

    SRO = await ethers.getContractFactory('SarahRo');
    sarahRo = await SRO.connect(owner).deploy();
    await sarahRo.deployed();

    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(owner).deploy(sarahRo.address);
    await ico.deployed();

    await sarahRo.connect(owner).approve(ico.address, ethers.utils.parseEther('500000000'));
    ico.connect(owner).startIco(ethers.utils.parseEther('500000000'))
    });
     
    describe('Deployment ICO', function () {
      it("Should revert if its not deployed by the owner of SarahRo", async function () {
        await expect(ICO.connect(alice).deploy(sarahRo.address)).to.revertedWith("ICO: only the owner of the SRO can deploy this ICO")
      });

      it("Should has start counting time until the end of the ICO", async function () {
        expect(await ico.secondeRemaining()).to.equal(1209600);
        await ethers.provider.send('evm_increaseTime', [10]);
        await ethers.provider.send('evm_mine');
        expect(await ico.secondeRemaining()).to.equal(1209590);
      });

      it("Should has a rate as given when owner deployed the contract", async function () {
       expect(await ico.connect(owner).rate()).to.equal(1e9);
      });
    });

    describe('function startIco()', function () {
      it("Should revert if its not deployed by the owner of SarahRo", async function () {
        await expect(ico.connect(alice).startIco(500)).to.revertedWith("Ownable: caller is not the owner")
      });

      it("Should revert if owner try to start twice the ico", async function () {
        await ico.connect(owner).startIco(500);
        await expect(ico.connect(owner).startIco(5000)).to.revertedWith("ICO: you already started the ico")
      });

      it("Should revert the owner of SRO still does not approved this contract", async function () {
        const ico2 = await ICO.connect(owner).deploy(sarahRo.address);
        await ico2.deployed();
        await expect(ico2.connect(owner).startIco(500)).to.revertedWith("Calculator: you have to approve this contract first to start the ico")
      });

      it("Should revert the amount is bigger than the allowance made to the ico", async function () {
        const ico2 = await ICO.connect(owner).deploy(sarahRo.address);
        await ico2.deployed();
        await sarahRo.connect(owner).approve(ico2.address, 1000);
        await expect(ico2.connect(owner).startIco(2000)).to.revertedWith("ICO: You can't set an amount bigger than the amount you approved to this contract")
      });

      it("Should set timer on !", async function () {
        await ethers.provider.send('evm_increaseTime', [9600]);
        await ethers.provider.send('evm_mine');
        expect (await ico.secondeRemaining()).to.equal(1200000)
      });

      it("Should set the supply for the ico", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.000000001')), to: ico.address});
        expect (await ico.supplyICORemaining()).to.equal(ethers.utils.parseEther('499999999'))
      });
    });

    describe('receive() & function buyTokens()', function () {
      it("Should revert if the ICO has not started yet", async function () {
        const ico2 = await ICO.connect(owner).deploy(sarahRo.address);
        await ico2.deployed();
        await sarahRo.connect(owner).approve(ico2.address, (await ethers.utils.parseEther('100')));
        await expect(ico2.connect(alice).buyTokens({value: (await ethers.utils.parseEther('1'))})).to.revertedWith("ICO: Sorry this ico has not started yet, be patient");
      });

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

      it("Should emit event 'Transfer'", async function () {
        await expect(alice.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address}))
          .to.emit(sarahRo, 'Transfer')
          .withArgs(owner.address, alice.address, (await ethers.utils.parseEther('100000000')));
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
        await charlie.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address})
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

    describe('function totalSupply()', function () {
      it("Should display the total supply of SRO", async function () {
        expect (await ico.totalSupply()).to.equal(ethers.utils.parseEther('1000000000'))
      });
    });

    describe('function tokenPrice()', function () {
      it("Should display the price of SRO", async function () {
        expect (await ico.tokenPrice()).to.equal(await ethers.utils.parseEther('0.000000001'))
      });
    });

    describe('function supplyICORemaining()', function () {
      it("Should display amount of token remaining", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        expect (await ico.supplyICORemaining()).to.equal(ethers.utils.parseEther('300000000'))
      });                                                                                     
    });

    describe('function totalTokenSold()', function () {
      it("Should display the total token sold", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        await ico.connect(bob).buyTokens({value: (await ethers.utils.parseEther('0.015'))})
        await charlie.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address})
        expect(await ico.connect(owner).totalTokenSold()).to.equal((await ethers.utils.parseEther('0.315').mul(await ico.rate())));
      });
    });

    describe('function totalWeiGained()', function () {
      it("Should display the total wei gained", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        await ico.connect(bob).buyTokens({value: (await ethers.utils.parseEther('0.015'))})
        await charlie.sendTransaction({value: (await ethers.utils.parseEther('0.1')), to: ico.address})
        expect(await ico.connect(owner).totalWeiGained()).to.equal((await ethers.utils.parseEther('0.315')));
      });
    });

    describe('function balanceOf()', function () {
      it("Should display token amount of the account put in parameter", async function () {
        await alice.sendTransaction({value: (await ethers.utils.parseEther('0.2')), to: ico.address})
        expect (await ico.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('200000000'))
      });                                                                                     
    });

    describe('function rate()', function () {
      it("Should display the rate of conversion token between SRO and ETH.", async function () {
        expect (await ico.rate()).to.equal(1e9)
      });                                                                                     
    });

    describe('function secondRemaining()', function () {
      it("Should return how many second remain until the end of this ico.", async function () {
        await ethers.provider.send('evm_increaseTime', [10]);
        await ethers.provider.send('evm_mine');
        expect (await ico.secondeRemaining()).to.equal(1209590)
      });                                                                                     
    });
});

describe("Calculator", () => {
  let SRO, sarahRo, ICO, ico, CALCULATOR, calculator, owner, alice, bob, charlie;

  beforeEach(async function () {
    [SRO, sarahRo, ICO, ico, CALCULATOR, calculator, owner, alice, bob, charlie] = await ethers.getSigners();

    SRO = await ethers.getContractFactory('SarahRo');
    sarahRo = await SRO.connect(owner).deploy();
    await sarahRo.deployed();
    await sarahRo.connect(owner).approve(ico.address, ethers.utils.parseEther('500000000'));
    await sarahRo.connect(owner).transfer(alice.address, 20)
    await sarahRo.connect(owner).transfer(bob.address, 20)

    CALCULATOR = await ethers.getContractFactory('Calculator');
    calculator = await CALCULATOR.connect(owner).deploy(sarahRo.address);
    await calculator.deployed();
    await sarahRo.connect(alice).approve(calculator.address, ethers.utils.parseEther('500000000'));
    await sarahRo.connect(bob).approve(calculator.address, ethers.utils.parseEther('500000000'));
  });

  describe('Deployment calculator', function () {
    it("should make msg.sender the owner of this contract", async function () {
      expect(await calculator.owner()).to.equal(owner.address)
    });
  });

  describe('function add()', function () {
    it("should revert if msg.sender does not have any SRO", async function () {
      await sarahRo.connect(charlie).approve(calculator.address, ethers.utils.parseEther('500000000'));
      await expect(calculator.connect(charlie).add(1, 2)).to.revertedWith("Calculator: not enought money, you need pay at least 1 SRO to execute the function")
    });

    it("should revert if msg.sender has not approved calculator", async function () {
      await sarahRo.connect(owner).transfer(charlie.address, 20)
      await expect(calculator.connect(charlie).add(1,2)).to.revertedWith("Calculator: you have to approve this contract first to use functions")
    });

    it("should send 1 token as fees to the owner", async function () {
      await expect(() => calculator.connect(alice).add(1,2)
        .to.changeTokenBalance('SRO', [alice.address, calculator.owner()], 1));
    });

    it("should return the addition of both parameters and emit event 'Added'", async function () {
      await expect(calculator.connect(alice).add(1,2))
        .to.emit(calculator, "Added")
        .withArgs(alice.address, 3)
    });

    it("should increase the profit state variable by 1", async function () {
      expect(await calculator.connect(owner).seeProfit()).to.equal(0);
      await calculator.connect(alice).add(1,2);
      expect(await calculator.connect(owner).seeProfit()).to.equal(1);
    });
  });

  describe('function sub()', function () {
    it("should return the substraction of both parameters and emit event 'Subbed'", async function () {
      await expect(calculator.connect(alice).sub(5,2))
        .to.emit(calculator, "Subbed")
        .withArgs(alice.address, 3)
    });
  });

  describe('function mul()', function () {
    it("should return the multiplication of both parameters and emit event 'Muled'", async function () {
      await expect(calculator.connect(alice).mul(5,2))
        .to.emit(calculator, "Muled")
        .withArgs(alice.address, 10)
    });
  });

  describe('function div()', function () {
    it("should return the division of both parameters and emit event 'Divided'", async function () {
      await expect(calculator.connect(alice).div(6,2))
        .to.emit(calculator, "Divided")
        .withArgs(alice.address, 3)
    });
  });

  describe('function mod()', function () {
    it("should return the rest of the number moduled and emit event 'Moduled'", async function () {
      await expect(calculator.connect(alice).mod(6,4))
        .to.emit(calculator, "Moduled")
        .withArgs(alice.address, 2)
    });
  });

  describe('function seeProfit()', function () {
    it("should revert if not called by the owner", async function () {
      await expect( calculator.connect(alice).seeProfit()).to.revertedWith("Ownable: caller is not the owner")
    });

    it("should return the total amount of profit generated", async function () {
      await calculator.connect(alice).add(1,2);
      await calculator.connect(bob).sub(1,2);
      await calculator.connect(bob).mul(1,2);
      await calculator.connect(alice).mod(1,2);
      await calculator.connect(alice).add(1,2);
      expect(await calculator.connect(owner).seeProfit()).to.equal(5)
    });
  });
});
