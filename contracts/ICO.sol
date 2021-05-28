// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ICO is Ownable {
  IERC20 private _sarahro;
  IERC20Metadata private _srahroMetadata;

  mapping (address => uint256) private _balances;

  constructor(address sarahroAddress){
      _sarahro = IERC20(sarahroAddress);
      _srahroMetadata = IERC20Metadata(sarahroAddress);
  }
}
