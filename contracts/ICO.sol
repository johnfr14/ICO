// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SarahRo.sol";

/// @title ICO of SRO token
/// @author Tondelier Jonathan
contract ICO is Ownable {

    using Address for address payable;

    SarahRo private _sarahro;

    uint256 private _rate;
    uint256 private _supply;
    uint256 private _weiGained;
    uint256 private _endIco;
    bool private _started;

    event Bought(address indexed sender, uint256 amount);
    event Withdrew(address indexed sender, uint256 amount);

    /**
     * @dev ico is running :
     *      Will be useful for each function that require interraction with the investors,
     *      as long as the ico is running they can buy tokens.
     *
     *  Requirement:
     *
     * - `block.timestamp` must be superior than the end of ico.
     */
    modifier icoIsRunning() {
        if (_endIco == 0) {
            revert("ICO: Sorry this ico has not started yet, be patient");
        }
        require(block.timestamp < _endIco, "ICO: Sorry this ico is already finnish go FOMO market buy on exchange");
        _;
    }

    /// @dev revert if the owner does not already approved this contract to spend SRO.
    modifier hasApproved() {
        if(_sarahro.allowance(msg.sender, address(this)) < 1) {
            revert("Calculator: you have to approve this contract first to start the ico");    
        }
        _; 
    }

     /**
     * @dev deployment of ico :
     * @param sarahroAddress We will communicate the ico with the ERC20 sarahro.
     * @notice by default the rate is set at 1e9
     *
     *  Requirement:
     *
     * - `msg.sender` must be the owner of SRO tokens. 
     */
    constructor(address sarahroAddress) {
        _sarahro = SarahRo(sarahroAddress);
        require(msg.sender == _sarahro.owner(), "ICO: only the owner of the SRO can deploy this ICO");
        _rate = 1e9;
    }

    /**
     * @dev start ico :
     * @param supply_ We will set a supply to sell.
     * @notice We will also set up a timer for 2weeks that will allow investor to buy the tokens of this ico.
     *         and set true the _started variable.
     *
     *  Requirement:
     *
     * - `msg.sender` must be the owner of this contract. 
     * - `msg.sender` must has approved the supply_ he wants to sell to this contract.
     * - `msg.sender` can't set a supply bigger than he has approved.
     */
    function startIco(uint256 supply_) public onlyOwner() hasApproved(){
        require(_started == false, "ICO: you already started the ico");
        require(_sarahro.allowance(msg.sender, address(this)) >= supply_, "ICO: You can't set an amount bigger than the amount you approved to this contract");
        _endIco = block.timestamp + 2 weeks;
        _supply = supply_;
        _started = true;
    }

    /**
     * @dev receive and buy token :
     *      these two functions are similar, people can use a function to buy token or send it directly into
     *      the smart contract once sent the smart contract will transfer the amount depending of the rate of tokens,
     *      from the owner of SRO tokens to the msg.sender.
     *      and reduce the supply remaining of this ico in order to check how many tokens is remaining.
     *      it revert if people try to buy more than it remains.
     *
     * Emits an {Bought} event indicating the purchase of tokens.
     *
     * Requirements: see modifier {icoIsRunning}.
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
     *      Once and only once the ico is finish, the owner can withdraw all the balance of this contract.
     *
     * Emits an {Withdrew} event indicating the transaction amount.
     *
     * Requirements: see {Ownable.sol}.
     *
     * - `block.timestamp` must be superior to _endIco in order to withdraw all the balance of the contract.
     * - `address(this).balance` must have at least 1 wei in his balance.
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
     *      
     * @return the total supply of SRO tokens.
     */
    function totalSupply() public view returns (uint256) {
        return _sarahro.totalSupply();
    }

    /**
    * @dev token price :
    *      
    * @return the price (in ether) of 1 SRO. 
    */
    function tokenPrice() public view returns (uint256) {
        return _rate;
    }

    /**
    * @dev supply remaining to be sold :
    *      
    * @return check how many token investors can buy.
    */
    function supplyICORemaining() public view icoIsRunning() returns (uint256) {
        return _sarahro.allowance(owner(), address(this));
    }

    /**
    * @dev supply remaining to be sold :
    *     
    * @return  check how many token has been sold. 
    */
    function totalTokenSold() public view onlyOwner() returns (uint256) {
        return _supply - _sarahro.allowance(owner(), address(this));
    }

    /**
    * @dev supply remaining to be sold :
    *      
    * @return the total amount of token sold in wei.
    */
    function totalWeiGained() public view onlyOwner() returns (uint256) {
        return _weiGained;
    }

    /**
    * @dev balance of :
    *      check how many token investors has in their wallets.
    * @param account account to be checked. 
    * @return the SRO balance of the account put in parameter. 
    */
    function balanceOf(address account) public view returns (uint256) {
        return  _sarahro.balanceOf(account);
    }

    /**
    * @dev rate :
    *      
    * @return the rate of conversion token between SRO and ETH. 
    */
    function rate() public view returns (uint256) {
        return _rate;
    }

    /**
    * @dev second remaining :
    *       
    * @return how many second remain until the end of this ico.
    */
    function secondeRemaining() public view returns (uint256) {
        return _endIco - block.timestamp; 
    }
}
