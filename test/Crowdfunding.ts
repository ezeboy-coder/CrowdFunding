import { expect } from "chai";
import { ethers } from "hardhat";
import { Crowdfunding, ERC20Mock } from "../typechain";

describe("Crowdfunding", function () {
  let crowdfunding: Crowdfunding;
  let token: ERC20Mock;
  let owner: any, backer1: any, backer2: any;

  beforeEach(async function () {
    [owner, backer1, backer2] = await ethers.getSigners();

    
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    token = await ERC20Mock.deploy("Test Token", "TST", owner.address, 1000000);
    await token.waitForDeployment();

    
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    crowdfunding = await Crowdfunding.deploy(token.target);
    await crowdfunding.waitForDeployment();

    await token.transfer(backer1.address, 1000);
    await token.transfer(backer2.address, 1000);
  });

  it("Should create a campaign", async function () {
    await crowdfunding.createCampaign(1000, 3600);
    const campaign = await crowdfunding.campaigns(0);
    expect(campaign.creator).to.equal(owner.address);
    expect(campaign.goal).to.equal(1000);
    expect(campaign.deadline).to.be.gt(0);
  });

  it("Should allow backers to fund a campaign", async function () {
    await crowdfunding.createCampaign(1000, 3600);

    await token.connect(backer1).approve(crowdfunding.target, 500);

    
    await crowdfunding.connect(backer1).fundCampaign(0, 500);

    const campaign = await crowdfunding.campaigns(0);
    expect(campaign.totalFunds).to.equal(500);
  });

  it("Should release funds if goal is reached", async function () {
    await crowdfunding.createCampaign(1000, 3600);

    
    await token.connect(backer1).approve(crowdfunding.target, 1000);

    
    await crowdfunding.connect(backer1).fundCampaign(0, 1000);

    await ethers.provider.send("evm_increaseTime", [3600]);

    
    await crowdfunding.releaseFunds(0);

    const campaign = await crowdfunding.campaigns(0);
    expect(campaign.fundsReleased).to.be.true;
  });

  it("Should refund backers if goal is not reached", async function () {
    await crowdfunding.createCampaign(1000, 3600);

   
    await token.connect(backer1).approve(crowdfunding.target, 500);

 
    await crowdfunding.connect(backer1).fundCampaign(0, 500);

    await ethers.provider.send("evm_increaseTime", [3600]);

   
    await crowdfunding.connect(backer1).refund(0);

   
    const balance = await token.balanceOf(backer1.address);

    expect(balance).to.equal(1000); 
  });
});