// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { ethers, deployments } = hre;

async function main() {
  [deployer, signer, random] = await ethers.getSigners();

  visualMassageModule = await ethers.getContract("VisualMassageModule");

  // MOCK.
  const NF721Mock = await ethers.getContractFactory("NF721Mock", deployer);
  nftContract = await NF721Mock.deploy();
  await nftContract.initialize(
    "NF721Mock",
    "NF721Mock",
    "",
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
    [{ enabled: true, minter: true, module: visualMassageModule.address }],
    ethers.constants.AddressZero,
    0
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
