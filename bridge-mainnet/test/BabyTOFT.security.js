const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BabyTOFT mainnet safety preflight", function () {
  let owner, alice, bob, endpoint, token;
  const ONE = 1_000_000n;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const Endpoint = await ethers.getContractFactory("EndpointDelegateMock");
    endpoint = await Endpoint.deploy();
    await endpoint.waitForDeployment();

    const Token = await ethers.getContractFactory("BabyTOFTHarness");
    token = await Token.deploy(await endpoint.getAddress(), owner.address);
    await token.waitForDeployment();
  });

  it("1/5 starts at zero supply and uses six local decimals", async function () {
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.decimals()).to.equal(6n);
    expect(await token.owner()).to.equal(owner.address);
  });

  it("2/5 exposes no public mint(address,uint256) function", async function () {
    const selector = ethers.id("mint(address,uint256)").slice(0, 10);
    const args = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256"],
      [alice.address, ONE]
    ).slice(2);

    await expect(
      owner.sendTransaction({ to: await token.getAddress(), data: selector + args })
    ).to.be.reverted;

    expect(await token.totalSupply()).to.equal(0n);
  });

  it("3/5 emergency pause blocks ordinary ERC20 transfers", async function () {
    await token.exposedCredit(alice.address, 2n * ONE, 30168);
    await token.pause();

    await expect(token.connect(alice).transfer(bob.address, ONE)).to.be.reverted;
    expect(await token.balanceOf(alice.address)).to.equal(2n * ONE);
  });

  it("4/5 emergency pause blocks the outbound OFT debit/burn path", async function () {
    await token.exposedCredit(alice.address, 2n * ONE, 30168);
    await token.pause();

    await expect(
      token.exposedDebit(alice.address, ONE, ONE, 30168)
    ).to.be.reverted;

    expect(await token.balanceOf(alice.address)).to.equal(2n * ONE);
  });

  it("5/5 emergency pause blocks the inbound OFT credit/mint path and unpause restores transfers", async function () {
    await token.pause();
    await expect(token.exposedCredit(alice.address, ONE, 30168)).to.be.reverted;

    await token.unpause();
    await token.exposedCredit(alice.address, ONE, 30168);
    await token.connect(alice).transfer(bob.address, ONE);

    expect(await token.balanceOf(bob.address)).to.equal(ONE);
  });
});
