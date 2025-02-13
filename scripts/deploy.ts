import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);


  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
  const token = await ERC20Mock.deploy("Test Token", "TST", deployer.address, 1000000);
  await token.waitForDeployment();

  console.log("Token deployed to:", token.target);

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(token.target);
  await crowdfunding.waitForDeployment();

  console.log("Crowdfunding deployed to:", crowdfunding.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });