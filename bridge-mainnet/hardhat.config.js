require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    robinhood: {
      url: process.env.RH_RPC_URL || "https://rpc.mainnet.chain.robinhood.com",
      chainId: 4663,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
