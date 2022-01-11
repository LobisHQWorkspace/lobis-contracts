import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";

import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

import { HardhatUserConfig } from "hardhat/types";

require("dotenv").config();

const chainIds = {
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};


const hhconfig: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.7.5",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: 'https://eth-mainnet.alchemyapi.io/v2/MFUlslthtwp5QyRBBYKO8-eAYlKfEL_M',
      },
      chainId: chainIds.hardhat,
    }
  },
  namedAccounts: {
    deployer: 0,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
};
export default hhconfig;
