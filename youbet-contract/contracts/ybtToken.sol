// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YBToken is ERC20 {
    address payable private casino;
    constructor() ERC20("You Bet Token", "YBT") {
        _mint(msg.sender, 100000000 * 10 ** 18);
        casino = payable(msg.sender);
    }
    struct Bet{
        address bettor1;
        address bettor2;
        uint256 wager;
        string gameid;
        string bettor1team;
        string bettor2team;
        uint256 complete;
        string winner;
    }
    
    //maps a user to all of their Bets
    mapping (address => string[]) userBets;
    mapping (address => uint256) userBetAmounts;
    mapping(string => Bet) public Bets;
    //maps a gameid to all of the bets for that Games
    mapping (string => string[]) Games;
    
    //Token Exchange Rate in ether
    uint256 TER = 10000;
    //wager Exchange Rate
    uint256 wagerER = 10 ** 18;
    // Events
    event BetCreated(address creator, uint256 wager, string gameid, string betid);
    event BetAccept(address creator, address acceptor, uint256 wager);
    event BetExecute(address bettor1, address bettor2, uint256 wager, string gameid);
    
    
    
    modifier isCasino() {
        require(msg.sender == casino, "onlyCasino");
        _;
    }
    
    modifier isBettor() {
        require(msg.sender != casino, "onlyBettor");
        _;
    }
    
    function getCasino() public returns (address) {
        return casino;
    }
    
    function destruct() public {
        selfdestruct(casino);
    }
    
    function createBet(uint256 wager, string memory gameid, string memory betid, string memory bettor1team, string memory bettor2team) public isBettor() {
        require(balanceOf(msg.sender) - (userBetAmounts[msg.sender] + wager) >= 0 );
        userBetAmounts[msg.sender] += wager;
        userBets[msg.sender].push(betid);
        Bets[betid].bettor1 = msg.sender;
        Bets[betid].wager = wager * 10 ** 18;
        Bets[betid].gameid = gameid;
        Bets[betid].bettor1team = bettor1team;
        Bets[betid].bettor2team = bettor2team;
        Bets[betid].complete = 0;
        Games[gameid].push(betid);
        emit BetCreated(msg.sender, wager, gameid, betid);
    }
    
    function acceptBet(string memory betid) public isBettor(){
        uint256 wager = Bets[betid].wager;
        require(balanceOf(msg.sender) - (userBetAmounts[msg.sender] + wager) >= 0 );
        userBetAmounts[msg.sender] += wager;
        userBets[msg.sender].push(betid);
        Bets[betid].bettor2 = msg.sender;
        emit BetAccept(Bets[betid].bettor1, msg.sender, wager);
    }
    
    function execGame(string memory gameid, string memory winner) public isCasino() {
        for (uint i; i < Games[gameid].length; i++) {
            Bet storage bet = Bets[Games[gameid][i]];
            bet.winner = winner;
            bet.complete = 1;
        }
    }

    function execBet(string memory betid) public {
        Bet memory bet = Bets[betid];
        if(bet.complete != 1){
            revert("Bet Not complete");
        }
        if(bet.bettor1 == msg.sender){
            if(keccak256(abi.encodePacked(bet.winner)) != keccak256(abi.encodePacked(bet.bettor1team))){
                transfer(bet.bettor2, bet.wager);
            }
        } else if(bet.bettor2 == msg.sender){
            if(keccak256(abi.encodePacked(bet.winner)) != keccak256(abi.encodePacked(bet.bettor2team))){
                transfer(bet.bettor1, bet.wager);
            }
        }
    }
}