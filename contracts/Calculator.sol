// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SarahRo.sol";

contract Calculator is Ownable {

    SarahRo private _sarahro;
    uint256 private _profit;
    uint256 private _counter;

    // Events
    event Added(address indexed account, int256 res);
    event Subbed(address indexed account, int256 res);
    event Muled(address indexed account, int256 res);
    event Divided(address indexed account, int256 res);
    event Moduled(address indexed account, int256 res);
    
    modifier hasToken() {
        require(_sarahro.balanceOf(msg.sender) >= 1, "Calculator: not enought money, you need pay at least 1 SRO to execute the function");
        _;
    }

    modifier approve() {
        if(_sarahro.allowance(msg.sender, address(this)) < 1) {
            _sarahro.approve(msg.sender, address(this), 1^100000);    
        }
        _; 
    }

    constructor(address sarahroAddress) {
        _sarahro = SarahRo(sarahroAddress);
    }
    
    function add(int256 nb1, int256 nb2) public hasToken() approve() returns(int256) {
        _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Added(msg.sender, nb1 + nb2);
        _profit++;
        return nb1 + nb2;
    }
    
    function sub(int256 nb1, int256 nb2) public approve() hasToken() returns(int256) {
       _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Subbed(msg.sender, nb1 - nb2);
       _profit++;
        return nb1 - nb2;
    }
    
    function mul(int256 nb1, int256 nb2) public approve() hasToken() returns(int256) {
       _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Muled(msg.sender, nb1 * nb2);
        _profit++;
        return nb1 * nb2;
    }
    
    function div(int256 nb1, int256 nb2) public approve() hasToken() returns(int256) {
        _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Divided(msg.sender, nb1 / nb2);
        _profit++;
        return nb1 / nb2;
    }
    
    function mod(int256 nb1, int256 nb2) public approve() hasToken() returns(int256) {
        _sarahro.transferFrom(msg.sender, owner(), 1);
        emit Moduled(msg.sender, nb1 % nb2);
        _profit++;
        return nb1 % nb2;
    }
    
    function seeProfit() public view onlyOwner() returns(uint256) {
        return _profit;
    }
    
}
