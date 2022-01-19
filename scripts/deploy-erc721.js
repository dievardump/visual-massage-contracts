// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {

  const forgeMaster = await ethers.getContract('ForgeMaster');
  const module = await ethers.getContract('VisualMassageModule');

  const tx = await forgeMaster.createERC721(
      "VisualMassage by A. L. Crego",
      "VMALC",
      'ipfs://Qme8vnJTucp4KgW5i2AbSbio2HzUfV4fxvh88i33gDtd4k',
      true,
      ethers.constants.AddressZero,
      [{ enabled: true, minter: true, module: module.address }],
      ethers.constants.AddressZero,
      0,
      'visual-massage-by-a-l-crego',
      ''
  );

  const receipt = await tx.wait();

  console.log(receipt.logs);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
