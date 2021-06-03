// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SarahRo.sol";

/// @title ICO of SRO token
/// @author Tondelier Jonathan
/// @notice You can use this contract for only the most basic simulation
/// @dev All function calls are currently implemented without side effects
contract ICO is Ownable {

    using Address for address payable;

    SarahRo private _sarahro;

    uint256 private _rate;
    uint256 private _supply;
    uint256 private _weiGained;
    uint256 private _endIco;

    event Bought(address indexed sender, uint256 amount);
    event Withdrew(address indexed sender, uint256 amount);

    /**
     * @dev ico is running :
     *      Will be useful for each function that require interraction with the investors,
     *      as long as the ico is running they can buy tokens.
     */
    modifier icoIsRunning() {
        require(block.timestamp < _endIco, "ICO: Sorry this ico is already finnish go FOMO market buy on exchange");
        _;
    }

     /**
     * @dev deployment of ico :
     *      We will communicate the ico with the ERC20 sarahro.
     *      Only the owner of SRO can deploy it.
     *      We will also set up a timer for 2weeks that will allow investor to buy the tokens of this ico.
     *      the owner will decide the change rate between the tokens and the ethers.
     *      And finally the owner of SRO will approve this contract to spend a certain amount of tokens during this ico.
     * 
     *      
     */
    constructor(address sarahroAddress, uint256 amountToSell) {
    _sarahro = SarahRo(sarahroAddress);
    require(msg.sender == _sarahro.owner(), "ICO: only the owner of the SRO can deploy this ICO");
    _endIco = block.timestamp + 2 weeks;
    _rate = 1e9;
    _supply = amountToSell;
    _sarahro.approve(msg.sender, address(this), amountToSell);
    } 

    /**
     * @dev receive and buy token :
     *      these two functions are similar, people can use a function to buy token or send it directly ether into
     *      the smart contract once sent the smart contract will transfer the amount depending of the rate of tokens,*
     *      from the owner of SRO tokens to the msg.sender.
     *      and reduce the supply remaining of this ico in order to check how many tokens is remaining.
     *      it revert if people try to buy more than it remains.
     */
    receive() external payable icoIsRunning() {
        uint256 amountSRO = msg.value * _rate;
        if (supplyICORemaining() < amountSRO) {
            revert("SarahRo: there is not enought SRO remaining for your demand");
        }
        _sarahro.transferFrom(owner(), msg.sender, amountSRO);
        _weiGained += msg.value;
        emit Bought(msg.sender, amountSRO);
    }

    function buyTokens() public payable icoIsRunning() {
        uint256 amountSRO = msg.value * _rate;
        if (supplyICORemaining() < amountSRO) {
            revert("SarahRo: there is not enought SRO remaining for your demand");
        }
        _sarahro.transferFrom(owner(), msg.sender, amountSRO);
        _weiGained += msg.value;
        emit Bought(msg.sender, amountSRO);
    }

    /**
     * @dev withdraw balance :
     *      Once and only once the ico is finish, the owner can withdraw all the balance of this contract 
     */
    function withdrawBalance() public onlyOwner() {
        require(block.timestamp > _endIco, "ICO: Sorry this ico is still running, wait the end");
        require(address(this).balance > 0, "ICO: cannot withdraw 0 ether");
        uint256 amount = address(this).balance;
        payable(msg.sender).sendValue(amount);
        emit Withdrew(address(this), amount);
    }

     /**
     * @dev total supply :
     *      can check the total supply of SRO created
     */
    function totalSupply() public view returns (uint256) {
        return _sarahro.totalSupply();
    }

    /**
    * @dev supply remaining to be sold :
    *      check how many token has been sold
    */
    function tokenPrice() public view returns (uint256) {
        return _supply - _sarahro.allowance(owner(), address(this));
    }

    /**
    * @dev supply remaining to be sold :
    *      check how many token investors can buy
    */
    function supplyICORemaining() public view icoIsRunning() returns (uint256) {
        return _sarahro.allowance(owner(), address(this));
    }

    /**
    * @dev supply remaining to be sold :
    *      check how many token has been sold
    */
    function totalTokenSold() public view onlyOwner() returns (uint256) {
        return _supply - _sarahro.allowance(owner(), address(this));
    }

    /**
    * @dev supply remaining to be sold :
    *      check how many wei as been gained
    */
    function totalWeiGained() public view onlyOwner() returns (uint256) {
        return _weiGained;
    }

    /**
    * @dev balance of :
    *      check how many token investors has in their wallets
    */
    function balanceOf(address account) public view returns (uint256) {
        return  _sarahro.balanceOf(account);
    }

    /**
    * @dev rate :
    *      check the current change rate between SRO and ETH
    */
    function rate() public view returns (uint256) {
        return _rate;
    }

    /**
    * @dev time remaining :
    *      precisely when this ico will end
    */
    function timeRemaining() public view returns(string memory, uint256, string memory, uint256, string memory, uint256, string memory, uint256, string memory) {
        uint256 day_ = ((_endIco - block.timestamp)  % 1209600) / 86400;
        uint256 hour_ = ((_endIco - block.timestamp)  % 86400) / 3600;
        uint256 minute_ = ((_endIco - block.timestamp)  % 3600) / 60;
        uint256 seconde_ = ((_endIco - block.timestamp)  % 60);
        return ("il reste: ", day_, "jours, ", hour_, "heures, ", minute_, "minutes, ", seconde_, "secondes avant que l'ico se termine");
    }

      /**
    * @dev second remaining :
    *      check how many seconds it remains until the end of this ico 
    */
    function secondeRemaining() public view returns (uint256) {
        return _endIco - block.timestamp; 
    }
}
