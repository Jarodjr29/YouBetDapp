var Casino = artifacts.require("Casino");
var YBT = artifacts.require("YBToken");



module.exports = function(deployer) {
  deployer.deploy(Casino);
  deployer.deploy(YBT)
};


