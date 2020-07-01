pragma solidity ^0.6.6;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC777/ERC777.sol";
import 'https://github.com/Uniswap/uniswap-v2-periphery/contracts/interfaces/IWETH.sol';

contract JINJTokenABank is ERC777 {
    
    //eth
    address public WETH = 0xc778417E063141139Fce010982780140Aa0cD5Ab;
    uint private crowdfunding_inprogress = 0;
    uint private genesis = 100000*10**18;
    //token-rate
    mapping(address => uint) public TokenRate;
    mapping(address => mapping(address => uint)) public acountDeposit;
    uint ethrate;
    address _manager;

    modifier onlyManager {
      require(msg.sender == _manager, "no permision");
      _;
    }
    
    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }
    
    modifier crowdfunding() {
        require(crowdfunding_inprogress == 1, 'Crowfunding stoped');
        _;
    }
    
    constructor(
        string memory name, 
        string memory symbol
    ) public ERC777(name, symbol, new address[](0)) {
        
        _manager = msg.sender;
        crowdfunding_inprogress = 1;
        _mint(msg.sender, genesis, "", "");
    }
    
    
    function chanegManager(address newmanager) public onlyManager {
        _manager = newmanager;
    }
    
    function setTokenRate(address token, uint rate) public onlyManager {
        TokenRate[token] = rate;
    }
    
    function setETHRate(uint rate) public onlyManager {
        ethrate = rate;
    }
    
    function deposit(address token, uint amount) public lock crowdfunding {
        require(TokenRate[token] != 0, "Unrecognize the token");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount));
        acountDeposit[msg.sender][token] = acountDeposit[msg.sender][token].add(amount);
        _mint(msg.sender, amount.mul(TokenRate[token]), "", "");
    }
    
    function withdraw(address token) public onlyManager {
        assert(IERC20(token).transfer(msg.sender, IERC20(token).balanceOf(address(this))));
    }
    
    function withdraweth() public onlyManager {
        msg.sender.transfer(address(this).balance);
    }
    
    //receive ETH
    receive() external payable crowdfunding {
        require(ethrate != 0, "ETH not supported");
        require(msg.value > 0, "Do not Joke");
        acountDeposit[msg.sender][WETH] = acountDeposit[msg.sender][WETH].add(msg.value);
        _mint(msg.sender, msg.value.mul(ethrate), "", "");
    }
    
    //stop crowdfunding
    function stopCrowdfunding() public onlyManager {
        crowdfunding_inprogress = 0;
    }
    
}