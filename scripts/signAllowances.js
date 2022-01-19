// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {

  [deployer, signer] = await ethers.getSigners();

  const module = await ethers.getContract('VisualMassageModule');

  await signer.getAddress();

  if (!process.env.SIGNER || signer.address !== process.env.SIGNER) {
    console.log(signer.address, process.env.SIGNER);
    throw new Error('SIGNER CONFIG');
  }

  throw new Error('set recipients here.');

  const recipients = [];

  const allowances = [];

  for(const recipient of recipients) {
    const nonce = 0;
    const nonceForHelix = await module.nonceForHelix(0, nonce);

    const message = await module.createMessage(
      recipient,
      nonceForHelix,
    );

    const signature = await signer.signMessage(
      ethers.utils.arrayify(message)
    );

    allowances.push({
      address: recipient,
      nonce: nonce,
      signature
    });
  }

  console.log(allowances);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
