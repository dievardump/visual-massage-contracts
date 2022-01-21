const dotenv = require("dotenv");
dotenv.config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
require("hardhat-deploy-ethers");

const minimist = require("minimist");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

function mergeConfigs(path) {
  const { parsed } = dotenv.config({
    path,
  });

  if (!parsed) return;

  Object.keys(parsed).forEach((key) => {
    if ("" !== parsed[key]) {
      process.env[key] = parsed[key];
    }
  });
}

// load .env
dotenv.config();

// override .env with specific .env.[network]
var argv = minimist(process.argv.slice(2));
if (argv.network) {
  mergeConfigs(`.env.${argv.network}`);
}

const networks = {};
["rinkeby", "mainnet"].forEach((network) => {
  const accounts = [];
  if (process.env.DEPLOYER_KEY) {
    accounts[0] = process.env.DEPLOYER_KEY;
  }

  if (process.env.SIGNER_KEY) {
    accounts[1] = process.env.SIGNER_KEY;
  }

  networks[network] = {
    url: process.env.PROVIDER || "",
    accounts,
  };
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks,
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    signer: {
      default: 1, // here this will by default take the second account as signer
    },
  },
  external: {
    deployments: {
      mainnet: ["node_modules/@dievardump-web3/niftyforge/deployments/mainnet"],
      rinkeby: ["node_modules/@dievardump-web3/niftyforge/deployments/rinkeby"],
    },
  },
};
