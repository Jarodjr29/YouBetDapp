pragma solidity ^0.8.0;

import "./ybtToken.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract Casino is Ownable {
    // ERC20 token 
    YBToken public ybt; 
    // owner of the smart contract
    address payable public casino;
    constructor() payable {
        casino = payable(msg.sender);
        ybt = new YBToken();
    }
    //Token Exchange Rate in ether
    uint256 TER = 10000;
    //wager Exchange Rate
    uint256 wagerER = 10 ** 18;
    
    event YBTBought();
    event CashOut();
    
    modifier isBettor() {
        require(msg.sender != casino, "onlyBettor");
        _;
    }
    modifier isCasino() {
        require(msg.sender == casino, "OnlyCasino");
        _;
    }

    function getCasino() public returns (address) {
        return casino;
    }
    
    function buyYBT(uint256 amount) public payable isBettor() {
        require(msg.value > 0, "Need ETH");
        require((amount / TER) >= (msg.value / wagerER)); 
        ybt.transfer(msg.sender, amount * wagerER);
        emit YBTBought();
    }
    
    function cashOut(uint256 amount) public {
        require(amount > 0, "You need to sell at least some tokens");
        uint256 allowance = ybt.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        ybt.transferFrom(msg.sender, casino, amount);
        payable(msg.sender).transfer(amount / TER);
        emit CashOut();
    }

    function execGame(string memory gameid, string memory winner) public isCasino() {
        ybt.execGame(gameid, winner);
    }
}