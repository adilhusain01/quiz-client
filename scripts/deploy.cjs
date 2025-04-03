const hre = require("hardhat");
const { TronWeb } = require("tronweb");

async function main() {
  try {
    const tronWeb = new TronWeb({
      fullHost: "https://api.trongrid.io",
      privateKey: process.env.PRIVATE_KEY,
    });

    // Get the contract factory
    const QuizApp = await hre.ethers.getContractFactory("QuizApp");

    console.log("Deploying QuizApp contract...");
    const quizApp = await QuizApp.deploy();

    await quizApp.deployed();

    console.log("QuizApp contract deployed to:", quizApp.address);
    console.log("Save this address for interaction script!");
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
