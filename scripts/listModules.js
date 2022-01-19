// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {

  const module = await ethers.getContract('VisualMassageModule');

  const nftContractAddress = await module.nftContract();

  console.log(nftContractAddress);

  const nftContract = await ethers.getContractAt(
    'NiftyForge721',
    nftContractAddress
  );

  console.log(await nftContract.listModules());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
