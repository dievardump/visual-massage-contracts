// deploy/00_deploy_my_contract.js
module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	await deploy('VisualMassageModule', {
			from: deployer,
			args: [
					process.env.CONTRACT_URI || '',
					process.env.METADATA_URI,
					process.env.SIGNER,
					process.env.CONTRACT_OWNER || ethers.constants.AddressZero,
			],
			log: true,
	});
};
module.exports.tags = ['VisualMassageModule'];
