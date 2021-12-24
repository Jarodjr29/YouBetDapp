App = {
    web3Provider: null,
    contracts: {},
    names: new Array(),
    url: 'http://127.0.0.1:8545',
    casino: null,
    currentAccount: null,
    ybtAddress: null,
    avalBets: new Array(),

    //begins starting up the app
    init: function() {
        console.log("init");
        return App.initWeb3();
    },

    //creates a web3 instance for the app to talk to the blockchain
    initWeb3: function () {
        console.log("web3");
        //checks if there is an injected web3 instance running
        if (typeof web3 !== 'undefined') {
            console.log("undefined");
            App.web3Provider = web3.currentProvider;
        } else {
            console.log("defined");
            //if no instance, creates a new HTTP provider with the TestRPC
            //this means the app interacts with the blockchain via HTTP requests from the local test address
            //other options are WebSocket and IPC
            App.web3Provider = new Web3.providers.HttpProvider(App.url);
        }
        console.log("provider");
        web3 = new Web3(App.web3Provider);
        ethereum.enable();
        return App.initYBT();
    },

    //creates a Truffle Contract instance with artifact json file created
    //from the truffle-config.js file for YBToken.sol then sets the provider
    //to the apps  web3provider
    initYBT: function () {
        $.getJSON('YBToken.json', function (data) {
            console.log("YBT");
            //get the contract artifact file and create an instance with truffle
            var artifact = data;
            App.contracts.ybt = TruffleContract(artifact);
            console.log("artifact")
            App.contracts.mycontract = data;
            App.contracts.ybt.setProvider(App.web3Provider);
            //console.log(web3.eth.coinbase);
            App.currentAccount = web3.eth.coinbase;
            jQuery('#current_account').text(App.currentAccount);
            console.log("ybt started");
            return App.initCasino();
        })
    },

    //creates a Truffle Contract instance with artifact json file created
    //from the truffle-config.js file for Casino.sol. The artifact file is
    //a json representation of the contract created by the truffle compiler
    //then sets the provider to the apps  web3provider
    initCasino: function () {
        $.getJSON('casino.json', function (data) {
            console.log("initCasino");
            //get the contract artifact file and create an instance with truffle
            var artifact = data;
            App.contracts.casino = TruffleContract(artifact);
            App.contracts.mycontract = data;
            App.contracts.casino.setProvider(App.web3Provider);
            App.currentAccount = web3.eth.coinbase;
            console.log("casino Inited");
            App.contracts.casino.deployed().then(function (instance) {
                return instance.ybt.call();
            }).then(function(result) {
                if (result) {
                    App.ybtAddress = result;
                    App.getCasino();
                    console.log(App.ybtAddress);
                }
            });
        });
        return App.bindEvents();
    },

    bindEvents: function () {
        console.log("bindingEvents");
        $(document).on('click', '#executeBet', App.executeBet);
        $(document).on('click', '#createBet', App.createBet);
        $(document).on('click', '#executeGame', App.executeGame);
        $(document).on('click', '#buyYBT', App.buyYBT);
        $(document).on('click', '#getBal', App.getBal);
        $(document).on('click', '#acceptBet', App.acceptBet);
        console.log("eventsBounded");
    },

    //function for determining if a user is the casino or not.
    //refer to https://www.trufflesuite.com/docs/truffle/reference/contract-abstractions
    //for more insight on the what .deployed() does and contract abstractions
    //with Truffle. 
    getCasino: function() {
        App.contracts.casino.deployed().then(function (instance) {
            console.log("gettingCasino");
            return instance.casino.call();
        }).then(function(result) {
            App.casino = result;
            console.log(result);
            if(App.currentAccount == App.casino) {
                $(".casino").css("display", "inline");
                $(".bettor").css("display", "none");
            } else {
                console.log(App.avalBets);
                $(".bettor").css("display", "inline");
                $(".casino").css("display", "none");
                //for(var i = 0; i < avalBets.length; i++){
                //    var gameid = App.avalBets[i][0];
                //    var wager = App.avalBets[i][1];
                //    var team1 = App.avalBets[i][2];
                //    var team2 = App.avalBets[i][3];
                //    var betid = App.avalBets[i][4];
                //    var html = '<div class = "bet", id =' + betid + '>'
                //    html += '<p class = ' + betid + ' id = "gameid" value = ' + gameid + '>Game: ' + gameid + '</p>'
                //    html += '<p class = ' + betid + ' id = "wager" value = ' + wager + '>Wager: ' + wager + '</p>'
                //    html += '<p class = ' + betid + ' id = "team1" value = ' + team1 + '>Team Taken: ' + team1 + '</p>'
                //    html += '<p class = ' + betid + ' id = "team2" value = ' + team2 + '>Team Available: ' + team2 + '</p>'
                //    html += '<button id = "acceptBet" value = ' + betid + ">Accept</button>"
                //    html += "</div>"
                //    $("#gameid").val("");
                //    parseInt($("#wager").val(""));
                //    $("#team1").val("");
                //    $("#team2").val("");
                //    $("#betid").val("");
                //    $("#bets").append(html);
                //}
            }
        })
    },

    createBet: function() {
        var gameid = $("#gameid").val();
        var wager = parseInt($("#wager").val());
        var team1 = $("#team1").val();
        var team2 = $("#team2").val();
        var betid = $("#betid").val();
        console.log(gameid, ' ', wager, ' ', team1, ' ', team2, ' ', betid);
        App.contracts.ybt.at(App.ybtAddress).then(function (instance) {
            return instance.createBet(wager, gameid, betid, team1, team2, { from: App.currentAccount });
        }).then(function (result, err) {
            if (result) {
               // var html = '<div class = "bet", id =' + betid + '>'
                //html += '<p class = ' + betid + ' id = "gameid" value = ' + gameid + '>Game: ' + gameid + '</p>'
                //html += '<p class = ' + betid + ' id = "wager" value = ' + wager + '>Wager: ' + wager + '</p>'
                //html += '<p class = ' + betid + ' id = "team1" value = ' + team1 + '>Team Taken: ' + team1 + '</p>'
                //html += '<p class = ' + betid + ' id = "team2" value = ' + team2 + '>Team Available: ' + team2 + '</p>'
                //html += '<button id = "acceptBet" value = ' + betid + ">Accept</button>"
                //html += "</div>"
                $("#gameid").val("");
                parseInt($("#wager").val(""));
                $("#team1").val("");
                $("#team2").val("");
                $("#betid").val("");
                //$("#bets").append(html);
                //App.avalBets.push(Array(gameid, wager, team1, team2, betid));
                //console.log(App.avalBets);
                //
                console.log(result);
            }
        })
    },

    acceptBet: function(betid) {
        betid = $("#acceptbetid").val();
        console.log(betid);
        App.contracts.ybt.at(App.ybtAddress).then(function (instance) {
            return instance.acceptBet(betid, { from: App.currentAccount});
        }).then(function (result, err){
            console.log(result);
        })
    },

    buyYBT: function() {
        var amount = $('#ybtAmount').val();
        App.contracts.casino.deployed().then(function (instance) {
            return instance.buyYBT(amount, {value: web3.toWei(amount / 10000, "ether"), from: App.currentAccount});
        }).then(function (result, err) {
            if(result) {
                if (parseInt(result.receipt.status) == 1){
                    $('#ybtAmount').val("");
                    toastr['error']["Bet Not Created"];
                    console.log("ybtBought");
                } else {
                    toastr['error']["Bet Not Created"];
                }
            }
        })
    },

    getBal: function() {
        App.contracts.ybt.at(App.ybtAddress).then(function (instance) {
            return instance.balanceOf(App.currentAccount, {from: App.currentAccount});
        }).then(function (result, err) {
            if(result) {
                var html = "<h3>YBT Balance</h3>";
                html += "<p>" + (result.toNumber() / (10 ** 18)) + "</p>";
                $("#balance").append(html);
                console.log(html);
                console.log($("#balance"));
            }
        })
    },

    executeGame: function() {
        var gameid = $("#execGame").val();
        var winner = $("#execWinner").val();
        App.contracts.casino.deployed().then(function (instance) {
            return instance.execGame(gameid, winner, {from: App.currentAccount});
        }).then(function (result) {
            if(result) {
                console.log(result);
                $("#execGame").val("");
                $("#execWinner").val("");
            }
        })
    },

    executeBet: function() {
        console.log("executing")
        var betid = $("#execbetid").val();
        App.contracts.ybt.at(App.ybtAddress).then(function (instance) {
            return instance.execBet(betid, {from: App.currentAccount});
        }).then(function (result) {
            if(result){
                $("#execbetid").val("");
            }
        })
    },

};

$(function () {
    $(window).load(function () {
      console.log('wrosk');
      App.init();
      //Notification UI config
      toastr.options = {
        "showDuration": "1000",
        "positionClass": "toast-top-left",
        "preventDuplicates": true,
        "closeButton": true
      };
    });
  });
  
  // code for reloading the page on account change
  window.ethereum.on('accountsChanged', function (){
    location.reload();
  })