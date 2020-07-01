pragma solidity ^0.6.6;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC777/IERC777Recipient.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC777/IERC777.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/introspection/IERC1820Registry.sol";

contract SENSOJI is IERC777Recipient {


  mapping(address => uint) public giversM;
  mapping(address => bytes) public giversS;
  
  address _owner;
  IERC777 _token;
  mapping(address => bool) blacklist;
  address[] public personAccount;

  modifier onlyowner {
    require(msg.sender == _owner, "no permision");
    _;
  }
    
  IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

  // keccak256("ERC777TokensRecipient")
  bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH =
      0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b;

  constructor(IERC777 token) public {
    _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
    _owner = msg.sender;
    _token = token;
  }

  // call back function
  function tokensReceived(
      address operator,
      address from,
      address to,
      uint amount,
      bytes calldata userData,
      bytes calldata operatorData
  ) external override {
      
    if (blacklist[from] || blacklist[operator]) {
      revert("from blacklist");
    }
    personAccount.push(from);
    
    giversM[from] += amount;
    giversS[from] = userData;
    
  }

  // withdraw token
  function withdraw () external {
    require(msg.sender == _owner, "no permision");
    uint balance = _token.balanceOf(address(this));
    _token.send(_owner, balance, "");
  }

  
  function setBlack (
    address account,
    bool b
    ) onlyowner external {
          
    blacklist[account] = b;
  }

  function getPersonAmount() external view returns (uint) {
    return personAccount.length;
  }
  
  function getSAISENAmount() external onlyowner view returns (uint256) {
    return _token.balanceOf(address(this));
  }
  
  function getGiverSS(address user) external view returns (uint) {
    require(msg.sender == user, "no permision");  
    return giversM[user];
  }  
  
  function getGiverMessage(address user) external view returns (bytes memory) {
    //require(msg.sender == user, "no permision");  
    return giversS[user];
  }
}

