// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SarahRo.sol";

/// @title ICO of SRO token
/// @author Tondelier Jonathan
contract Calculator is Ownable {

    // State variables
    SarahRo private _sarahro;
    uint256 private _profit;
    uint256 private _counter;

    // Events
    event Added(address indexed account, int256 res);
    event Subbed(address indexed account, int256 res);
    event Muled(address indexed account, int256 res);
    event Divided(address indexed account, int256 res);
    event Moduled(address indexed account, int256 res);
    
    /// @dev make sure that the sender has SRO tokens
    modifier hasToken() {
        require(_sarahro.balanceOf(msg.sender) >= 1, "Calculator: not enought money, you need pay at least 1 SRO to execute the function");
        _;
    }

    /// @dev revert if the sender does not already approved this contract
    modifier approved() {
        if(_sarahro.allowance(msg.sender, address(this)) < 1) {
            revert("Calculator: you have to approve this contract first to use functions");    
        }
        _; 
    }

    /// @param sarahroAddress is address of the SRO smart contract 
    constructor(address sarahroAddress) {
        _sarahro = SarahRo(sarahroAddress);
    }
    
    /// @dev for each use the owner get 1 SRO
    /// @param nb1 The first number
    /// @param nb2 The second number
    /// @return the addition of both numbers
    function add(int256 nb1, int256 nb2) public hasToken() approved() returns(int256) {
        _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Added(msg.sender, nb1 + nb2);
        _profit++;
        return nb1 + nb2;
    }

    /// @dev for each use the owner get 1 SRO
    /// @param nb1 The first number
    /// @param nb2 The second number
    /// @return the substraction of both numbers
    function sub(int256 nb1, int256 nb2) public approved() hasToken() returns(int256) {
       _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Subbed(msg.sender, nb1 - nb2);
       _profit++;
        return nb1 - nb2;
    }
    
    /// @dev for each use the owner get 1 SRO
    /// @param nb1 The first number
    /// @param nb2 The second number
    /// @return the multiplication of both numbers
    function mul(int256 nb1, int256 nb2) public approved() hasToken() returns(int256) {
       _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Muled(msg.sender, nb1 * nb2);
        _profit++;
        return nb1 * nb2;
    }

    /// @dev for each use the owner get 1 SRO
    /// @param nb1 The first number
    /// @param nb2 The second number
    /// @return the division of both numbers
    function div(int256 nb1, int256 nb2) public approved() hasToken() returns(int256) {
        _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Divided(msg.sender, nb1 / nb2);
        _profit++;
        return nb1 / nb2;
    }
    
    /// @dev for each use the owner get 1 SRO
    /// @param nb1 The first number
    /// @param nb2 The second number
    /// @return the modulo of both numbers
    function mod(int256 nb1, int256 nb2) public approved() hasToken() returns(int256) {
        _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Moduled(msg.sender, nb1 % nb2);
        _profit++;
        return nb1 % nb2;
    }
    
    /// @dev see how many moula the owner has won since the deployment
    function seeProfit() public view onlyOwner() returns(uint256) {
        return _profit;
    }
    
}
