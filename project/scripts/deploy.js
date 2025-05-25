/**
 * Deploy script for VDapp smart contract
 * 
 * This script handles the deployment of the Voting contract to various networks.
 */

const hre = require("hardhat");

async function main() {
  console.log("Starting VDapp contract deployment...");

  // Get the Contract factory
  const VotingContract = await hre.ethers.getContractFactory("VotingContract");
  
  // Deploy the contract
  console.log("Deploying VotingContract...");
  const voting = await VotingContract.deploy();
  
  // Wait for deployment to complete
  await voting.deployed();
  
  console.log(`VotingContract deployed to: ${voting.address}`);
  
  // Log deployment information for easy reference
  console.log(`
Deployment details:
===================
Network: ${hre.network.name}
Contract address: ${voting.address}
Deployer address: ${(await hre.ethers.getSigners())[0].address}
Block number: ${await hre.ethers.provider.getBlockNumber()}
Gas used: ${(await voting.deployTransaction.wait()).gasUsed.toString()}
Transaction hash: ${voting.deployTransaction.hash}
  `);
  
  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await voting.deployTransaction.wait(5); // wait for 5 confirmations
  
  console.log("Verifying contract on Etherscan...");
  try {
    // Verify the contract on Etherscan for public networks
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      await hre.run("verify:verify", {
        address: voting.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } else {
      console.log("Skipping verification on development network");
    }
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
