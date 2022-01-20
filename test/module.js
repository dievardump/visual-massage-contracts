const { expect } = require('chai');
const { deployments, ethers } = require('hardhat');

describe('VisualMassageModule', () => {
    let deployer;
    let signer;
    let random;

    beforeEach(async () => {
        [deployer, signer, random] = await ethers.getSigners();

        await deployments.fixture();

        visualMassageModule = await ethers.getContract('VisualMassageModule')

        // MOCK.
        const NF721Mock = await ethers.getContractFactory(
            'NF721Mock',
            deployer,
        );
        nftContract = await NF721Mock.deploy();
        await nftContract.initialize(
            "NF721Mock",
            "NF721Mock",
            '',
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            [{ enabled: true, minter: true, module: visualMassageModule.address }],
            ethers.constants.AddressZero,
            0
        );

    });

    describe('Ownership', async function () {
        it('can transfer ownership', async function () {
            const owner = await visualMassageModule.owner();
            // signer is not current owner
            expect(signer.address).to.not.be.equal(owner);

            // set signer new owner
            await visualMassageModule.transferOwnership(signer.address);
            // expect new owner to be random account
            expect(await visualMassageModule.owner()).to.be.equal(signer.address);

            // expect to throw on subsequent calls since not owner anymore
            await expect(
                visualMassageModule.transferOwnership(signer.address),
            ).to.be.revertedWith('Ownable: caller is not the owner');

            // expect signer to be able to transfer ownership again
            await visualMassageModule
                .connect(signer)
                .transferOwnership(deployer.address);
        });
    });

    describe('Contract Data', async function () {
        it('can change contract URI if owner of contract', async function () {
            let newContractURI = 'ipfs://newURI';
            let contractURI = await visualMassageModule.contractURI();
            expect(contractURI).to.not.be.equal(newContractURI);

            await visualMassageModule.setContractURI(newContractURI);
            await expect(await visualMassageModule.contractURI()).to.be.equal(
                newContractURI,
            );
        });

        it('can not change contract URI if not owner of contract', async function () {
            let newContractURI = 'ipfs://newURI';

            await expect(
                visualMassageModule.connect(signer).setContractURI(newContractURI),
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('can change contract baseURI if owner of contract', async function () {
            let newBaseURI = 'ipfs://newURI';
            let baseURI = await visualMassageModule.baseURI();
            expect(baseURI).to.not.be.equal(newBaseURI);

            await visualMassageModule.setBaseURI(newBaseURI);
            await expect(await visualMassageModule.baseURI()).to.be.equal(
                newBaseURI,
            );
        });

        it('can not change contract URI if not owner of contract', async function () {
            let newBaseURI = 'ipfs://newURI';

            await expect(
                visualMassageModule.connect(signer).setBaseURI(newBaseURI),
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });

    describe('Helixes', async function () {
        it('can change full helix', async function () {
            const newHelix = {
                startId: 10,
                endId: 30,
                price: ethers.utils.parseEther("100"),
                signer: signer.address
            };;

            const helix = await visualMassageModule.helixes(1);
            expect(helix).to.not.be.deep.equal(
                newHelix,
            );

            await visualMassageModule.configureHelix(1, newHelix.startId, newHelix.endId, newHelix.price, newHelix.signer);
            expect(await visualMassageModule.helixes(1)).to.be.deep.equal(
                [newHelix.startId, newHelix.endId, newHelix.signer, newHelix.price],
            );
        });

        it('can change helix price', async function () {
            let newPrice = ethers.utils.parseEther('5.0');

            const helix = await visualMassageModule.helixes(1);
            expect(helix.price).to.not.be.equal(
                newPrice,
            );

            await visualMassageModule.setHelixPrice(1, newPrice);
            expect(await visualMassageModule.helixes(1).then(helix => helix.price)).to.be.equal(
                newPrice,
            );
        });

        it('can change helix ids', async function () {
            const helix = await visualMassageModule.helixes(1);
            expect([helix.startId, helix.endId]).to.not.be.equal(
                [10, 30],
            );

            await visualMassageModule.setHelixIds(1, 10, 30);
            expect(await visualMassageModule.helixes(1).then(helix => [helix.startId, helix.endId])).to.be.deep.equal(
                [10, 30],
            );
        });

        it('can change helix signer', async function () {
            const helix = await visualMassageModule.helixes(1);
            expect(helix.signer).to.not.be.equal(
                signer.address,
            );

            await visualMassageModule.setHelixSigner(1, signer.address);
            expect(await visualMassageModule.helixes(1).then(helix => helix.signer)).to.be.deep.equal(
                signer.address,
            );
        });

    });

    describe('Minting', async function () {
        it('can mint with signature', async function () {
            await visualMassageModule.setHelixSigner(0, await signer.getAddress());
            await visualMassageModule.setCollectActive(true);

            const nonce = 0;
            const nonceForHelix = await visualMassageModule.nonceForHelix(0, nonce);

            const message = await visualMassageModule.createMessage(
                await random.getAddress(),
                nonceForHelix,
            );

            const signature = await signer.signMessage(
                ethers.utils.arrayify(message)
            );

            await visualMassageModule.connect(random).collectWithSignature(
                110,
                nonce,
                signature
            );
        });

        it('can not mint with wrong signature', async function () {
            await visualMassageModule.setHelixSigner(0, await signer.getAddress());
            await visualMassageModule.setCollectActive(true);

            const nonce = 0;
            const nonceForHelix = await visualMassageModule.nonceForHelix(0, nonce);

            const message = await visualMassageModule.createMessage(
                await random.getAddress(),
                nonceForHelix,
            );

            const signature = await signer.signMessage(
                ethers.utils.arrayify(message)
            );

            await expect(visualMassageModule.connect(random).collectWithSignature(
                110,
                1, // change helix so signature won't go with message
                signature
            )).to.be.revertedWith('!INVALID_SIGNATURE!');
        });

        it('can not mint with with signature on wrong helix', async function () {
            await visualMassageModule.setHelixSigner(0, await signer.getAddress());
            await visualMassageModule.setCollectActive(true);

            const nonce = 0;
            const nonceForHelix = await visualMassageModule.nonceForHelix(0, nonce);

            const message = await visualMassageModule.createMessage(
                await random.getAddress(),
                nonceForHelix,
            );

            const signature = await signer.signMessage(
                ethers.utils.arrayify(message)
            );

            // change the helix, so the claim won't work
            await visualMassageModule.setCurrentHelix(1);

            await expect(visualMassageModule.connect(random).collectWithSignature(
                110,
                nonce,
                signature
            )).to.be.revertedWith('NotClaimable()');
        });

        it('can mint', async function () {
            await visualMassageModule.setCurrentHelix(1);
            await visualMassageModule.setCollectActive(true);
            const price = (await visualMassageModule.helixes(await visualMassageModule.currentHelixId())).price;
          	await visualMassageModule.collect(1, { value: price });
            expect(await nftContract.ownerOf(1)).to.be.equal(await deployer.getAddress());
        });

        it('can not mint with wrong value', async function () {
            await visualMassageModule.setCurrentHelix(1);
            await visualMassageModule.setCollectActive(true);
            await expect (visualMassageModule.collect(1, { value: 0 })).to.be.revertedWith('WrongValue()');
        });

        it('can not mint twice the same id', async function () {
            await visualMassageModule.setCurrentHelix(1);
            await visualMassageModule.setCollectActive(true);
            const price = (await visualMassageModule.helixes(await visualMassageModule.currentHelixId())).price;
          	await visualMassageModule.collect(1, { value: price });

            await expect (
                visualMassageModule.collect(1, { value: price })
            ).to.be.revertedWith('ERC721: token already minted')
        });
    });

    describe('Royalties - EIP2981', async function () {
        it('returns the right royalties on nfts', async function () {
            await visualMassageModule.setCurrentHelix(1);
            await visualMassageModule.setCollectActive(true);
            const price = (await visualMassageModule.helixes(await visualMassageModule.currentHelixId())).price;
            await visualMassageModule.collect(1, { value: price });
            expect(await nftContract.royaltyInfo(1, 400)).to.deep.equal([
                await visualMassageModule.owner(),
                ethers.BigNumber.from(40),
            ]);
        });
    });

    describe('TokenURI override', async function () {
        it('can override a specific tokenURI', async function () {
            await visualMassageModule.setCurrentHelix(1);
            await visualMassageModule.setCollectActive(true);
            const price = (await visualMassageModule.helixes(await visualMassageModule.currentHelixId())).price;
            await visualMassageModule.collect(1, { value: price });

            const newTokenURI = 'ipfs://random';
            expect(await nftContract.tokenURI(1)).to.not.be.equal(newTokenURI);
            await visualMassageModule.overrideTokenURI(1, newTokenURI);
            expect(await nftContract.tokenURI(1)).to.be.equal(newTokenURI);
        });
    });

    describe('Withdraw', async () => {
        it('withdrawing works', async function () {
            // first mint one
            await visualMassageModule.setCurrentHelix(1);
            await visualMassageModule.setCollectActive(true);
            const price = (await visualMassageModule.helixes(await visualMassageModule.currentHelixId())).price;
          	await visualMassageModule.collect(1, { value: price });

            const balance = await ethers.provider.getBalance(visualMassageModule.address);
            expect(balance).to.be.equal(price);

            // get values
            const { recipients, shares } = await visualMassageModule.getSplit();

            expect(shares[0]).to.not.equal(0);
            expect(shares[1]).to.be.gt(shares[0]);
            expect(shares[2]).to.be.gt(shares[1]);
            expect(shares[3]).to.be.gt(shares[2]);

            expect(shares[0].add(shares[1]).add(shares[2]).add(shares[3])).to.be.equal(balance);

            const accounts = [];
            for(const recipient of recipients) {
                accounts.push(new ethers.VoidSigner(
                    recipient,
                    deployer.provider,
                ));
            }

            const tx = await visualMassageModule.withdraw();
            await expect(tx).to.changeEtherBalances(accounts, shares);
        });
    });
});
