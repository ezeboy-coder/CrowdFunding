import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat"; // Import TypeChain plugin

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  typechain: {
    outDir: "typechain", // Output directory for TypeChain bindings
    target: "ethers-v6", // Use ethers-v6 bindings
  },
};

export default config;