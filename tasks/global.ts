import { task } from "hardhat/config";
import { BigNumber } from "@ethersproject/bignumber";

const ROUTER_ABI = require("../scripts/abis/Router.json");
const SUSHIFACTORY_ABI = require("../scripts/abis/SushiFactory.json");

task("configure-staking", "Configure staking part of Lobis").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const stakingWarmup = await deployments.get("StakingWarmup");
    const distributor = await deployments.get("Distributor");

    // set distributor contracts
    await deployments.execute(
      "LobisStaking",
      { from: deployer },
      "setContract",
      "0",
      distributor.address
    );

    // set warmup contracts
    await deployments.execute(
      "LobisStaking",
      { from: deployer },
      "setContract",
      "1",
      stakingWarmup.address
    );

    console.log("staking configured");
  }
);

task("configure-staked-lobi", "Configure staked LOBI").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const staking = await deployments.get("LobisStaking");
    const initialIndex = BigNumber.from(1).mul(BigNumber.from(10).pow(9));

    // initialize sLOBI
    await deployments.execute(
      "StakedLobiERC20",
      { from: deployer },
      "initialize",
      staking.address
    );

    // set initial index on sLOBI
    await deployments.execute(
      "StakedLobiERC20",
      { from: deployer },
      "setIndex",
      initialIndex
    );

    console.log("staked lobi configured");
  }
);

task("mint-lobi", "Mint initial LOBI supply").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const mintAmount = BigNumber.from(15000).mul(BigNumber.from(10).pow(9)); // TODO maybe change ?

    const treasury = await deployments.get("LobisTreasury");

    await deployments.execute(
      "LobiERC20",
      { from: deployer },
      "setVault",
      deployer
    );

    await deployments.execute(
      "LobiERC20",
      { from: deployer },
      "mint",
      deployer,
      mintAmount
    );

    await deployments.execute(
      "LobiERC20",
      { from: deployer },
      "setVault",
      treasury.address
    );

    console.log("LOBI minted");
  }
);

task("configure-distributor", "Configure distributor").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const initialRewardRate = "3000"; // 0.3%
    const staking = await deployments.get("LobisStaking");

    await deployments.execute(
      "Distributor",
      { from: deployer },
      "addRecipient",
      staking.address,
      initialRewardRate
    );

    console.log("distributor configured");
  }
);

task("configure-treasury", "Configure treasury").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const distributor = await deployments.get("Distributor");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      distributor.address
    );

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      distributor.address
    );

    console.log("treasury configured");
  }
);

task("configure-crv-bond", "Configure CRV bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "80";
    const bondVestingLength = "33230";
    const minBondPrice = "570264";
    const maxBondPayout = "500"; // 0.5% of totalSupply
    const bondFee = "5000";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryCRV");

    const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
    const FACTOR = 70000;

    await deployments.execute(
      "TokenBondDepositoryCRV",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryCRV",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    console.log("setStaking");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    console.log("toggle8");

    // set bond as reserve depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "0",
      bond.address
    );

    console.log("queue0");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "0",
      bond.address
    );

    console.log("toggle0");

    // set CRV as reserve asset
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "2",
      CRV
    );

    console.log("queue2");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "2",
      CRV
    );

    console.log("toggle2");

    // set token factor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "setTokenFactor",
      CRV,
      FACTOR
    );

    console.log("crv bond configured");
  }
);

task("configure-fxs-bond", "Configure FXS bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "80";
    const bondVestingLength = "33230";
    const minBondPrice = "155038";
    const maxBondPayout = "500"; // 0.5% of totalSupply
    const bondFee = "5000";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryFXS");

    const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";
    const FACTOR = 50000;

    await deployments.execute(
      "TokenBondDepositoryFXS",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryFXS",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    console.log("setStaking");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    console.log("toggle8");

    // set bond as reserve depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "0",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "0",
      bond.address
    );

    console.log("toggle0");

    // set FXS as reserve asset
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "2",
      FXS
    );

    console.log("queue2");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "2",
      FXS
    );

    console.log("toggle2");

    // set token factor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "setTokenFactor",
      FXS,
      FACTOR
    );
    console.log("fxs bond configured");
  }
);

task("configure-ohm-lobi-bond", "Configure OHM/LOBI bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "50";
    const bondVestingLength = "33230";
    const minBondPrice = "1693";
    const maxBondPayout = "500"; // 0.5% of totalSupply
    const bondFee = "5000";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryOHMLOBI");

    const SLP = "0x2734f4a846d1127f4b5d3bab261facfe51df1d9a";
    const FACTOR = 1000000;

    await deployments.execute(
      "TokenBondDepositoryOHMLOBI",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryOHMLOBI",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    console.log("staking");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    console.log("toggle8");

    // set bond as liquidity depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "4",
      bond.address
    );

    console.log("queue4");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "4",
      bond.address
    );

    console.log("toggle4");

    // set SLP as liquidity asset
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "5",
      SLP
    );

    console.log("queue5");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "5",
      SLP
    );

    console.log("toggle5");

    // set token factor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "setTokenFactor",
      SLP,
      FACTOR
    );
    console.log("ohm/lobi bond configured");
  }
);

task("configure-toke-bond", "Configure toke bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "70";
    const bondVestingLength = "33230";
    const minBondPrice = "232896";
    const maxBondPayout = "150"; // 0.15% of totalSupply
    const bondFee = "5000";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryTOKE2");

    const TOKE = "0x2e9d63788249371f1dfc918a52f8d799f4a38c94";
    const FACTOR = 140000;

    await deployments.execute(
      "TokenBondDepositoryTOKE2",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryTOKE2",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    console.log("setStaking");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    console.log("toggle8");

    // set bond as reserve depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "0",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "0",
      bond.address
    );

    console.log("toggle0");

    // set FXS as reserve asset
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "2",
      TOKE
    );

    console.log("queue2");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "2",
      TOKE
    );

    console.log("toggle2");

    // set token factor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "setTokenFactor",
      TOKE,
      FACTOR
    );
    console.log("toke bond configured");
  }
);

task("configure-cvx-bond", "Configure CVX bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "80";
    const bondVestingLength = "33230";
    const minBondPrice = "155038";
    const maxBondPayout = "500"; // 0.5% of totalSupply
    const bondFee = "5000";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryFXS");

    const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";
    const FACTOR = 50000;

    await deployments.execute(
      "TokenBondDepositoryFXS",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryFXS",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    console.log("setStaking");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    console.log("toggle8");

    // set bond as reserve depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "0",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "0",
      bond.address
    );

    console.log("toggle0");

    // set FXS as reserve asset
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "2",
      FXS
    );

    console.log("queue2");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "2",
      FXS
    );

    console.log("toggle2");

    // set token factor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "setTokenFactor",
      FXS,
      FACTOR
    );
    console.log("fxs bond configured");
  }
);

task("configure-gohm-bond", "Configure GOHM bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "80";
    const bondVestingLength = "33230";
    const minBondPrice = "155038";
    const maxBondPayout = "500"; // 0.5% of totalSupply
    const bondFee = "5000";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryFXS");

    const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";
    const FACTOR = 50000;

    await deployments.execute(
      "TokenBondDepositoryFXS",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryFXS",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    console.log("setStaking");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    console.log("toggle8");

    // set bond as reserve depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "0",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "0",
      bond.address
    );

    console.log("toggle0");

    // set FXS as reserve asset
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "2",
      FXS
    );

    console.log("queue2");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "2",
      FXS
    );

    console.log("toggle2");

    // set token factor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "setTokenFactor",
      FXS,
      FACTOR
    );
    console.log("fxs bond configured");
  }
);

task("configure-ohm-lobi-bond-2", "Configure OHM/LOBI bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "80";
    const bondVestingLength = "33230";
    const minBondPrice = "5427";
    const maxBondPayout = "150"; // 0.15% of totalSupply
    const bondFee = "5000";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryOHMLOBI2");

    const SLP = "0x193008EAAde86658Df8237A436261e23e3BcBbAa";
    const FACTOR = 1000000;

    await deployments.execute(
      "TokenBondDepositoryOHMLOBI2",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryOHMLOBI2",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    // console.log("staking");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "8",
      bond.address
    );

    console.log("queue8");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "8",
      bond.address
    );

    // console.log("toggle8");

    // set bond as liquidity depositor
    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "queue",
      "4",
      bond.address
    );

    console.log("queue4");

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "toggle",
      "4",
      bond.address
    );

    // console.log("toggle4");

    // // set SLP as liquidity asset
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "5",
    //   SLP
    // );

    // console.log("queue5");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "5",
    //   SLP
    // );

    // console.log("toggle5");

    // // set token factor
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "setTokenFactor",
    //   SLP,
    //   FACTOR
    // );
    console.log("ohm/lobi bond configured");
  }
);

task("configure-ohm-lobi-bond-3", "Configure OHM/LOBI bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "80";
    const bondVestingLength = "33230";
    const minBondPrice = "5000";
    const maxBondPayout = "25000"; // 25% of totalSupply
    const bondFee = "5000";
    const bondFeePartner = "0";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryOHMLOBI3");

    const SLP = "0x193008EAAde86658Df8237A436261e23e3BcBbAa";
    const FACTOR = 1000000;

    await deployments.execute(
      "TokenBondDepositoryOHMLOBI3",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryOHMLOBI3",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    // console.log("staking");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "8",
    //   bond.address
    // );

    // console.log("queue8");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "8",
    //   bond.address
    // );

    // // console.log("toggle8");

    // // set bond as liquidity depositor
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "4",
    //   bond.address
    // );

    // console.log("queue4");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "4",
    //   bond.address
    // );

    // console.log("toggle4");

    // // set SLP as liquidity asset
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "5",
    //   SLP
    // );

    // console.log("queue5");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "5",
    //   SLP
    // );

    // console.log("toggle5");

    // // set token factor
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "setTokenFactor",
    //   SLP,
    //   FACTOR
    // );
    console.log("ohm/lobi bond configured");
  }
);

task("configure-angle-bond", "Configure angle bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "250";
    const bondVestingLength = "33230";
    const minBondPrice = "3150000";
    const maxBondPayout = "150";
    const bondFee = "5000";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");
    const bond = await deployments.get("TokenBondDepositoryANGLE");

    const TOKE = "0x31429d1856ad1377a8a0079410b297e1a9e214c2";
    const FACTOR = 140000;

    await deployments.execute(
      "TokenBondDepositoryANGLE",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryANGLE",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    console.log("setStaking");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "8",
    //   bond.address
    // );

    // console.log("queue8");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "8",
    //   bond.address
    // );

    // console.log("toggle8");

    // // set bond as reserve depositor
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "0",
    //   bond.address
    // );

    // console.log("queue8");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "0",
    //   bond.address
    // );

    // console.log("toggle0");

    // // set FXS as reserve asset
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "2",
    //   TOKE
    // );

    // console.log("queue2");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "2",
    //   TOKE
    // );

    // console.log("toggle2");

    // // set token factor
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "setTokenFactor",
    //   TOKE,
    //   FACTOR
    // );
    console.log("angle bond configured");
  }
);

task("configure-gohm-bond", "Configure gohm bond").setAction(
  async (args, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const linkBondBCV = "350";
    const bondVestingLength = "33230";
    const minBondPrice = "140";
    const maxBondPayout = "150";
    const bondFee = "5000";
    const bondFeePartner = "110";
    const maxBondDebt = "1000000000000000";
    const intialBondDebt = "0";

    const stakingHelper = await deployments.get("StakingHelper");

    await deployments.execute(
      "TokenBondDepositoryGOHM",
      { from: deployer },
      "initializeBondTerms",
      linkBondBCV,
      bondVestingLength,
      minBondPrice,
      maxBondPayout,
      maxBondDebt,
      intialBondDebt,
      bondFee,
      bondFeePartner
    );

    await deployments.execute(
      "TokenBondDepositoryGOHM",
      { from: deployer },
      "setStaking",
      stakingHelper.address,
      true
    );

    console.log("setStaking");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "8",
    //   bond.address
    // );

    // console.log("queue8");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "8",
    //   bond.address
    // );

    // console.log("toggle8");

    // // set bond as reserve depositor
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "0",
    //   bond.address
    // );

    // console.log("queue8");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "0",
    //   bond.address
    // );

    // console.log("toggle0");

    // // set FXS as reserve asset
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "queue",
    //   "2",
    //   TOKE
    // );

    // console.log("queue2");

    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "toggle",
    //   "2",
    //   TOKE
    // );

    // console.log("toggle2");

    // // set token factor
    // await deployments.execute(
    //   "LobisTreasury",
    //   { from: deployer },
    //   "setTokenFactor",
    //   TOKE,
    //   FACTOR
    // );
    console.log("angle bond configured");
  }
);

task("create-sushi-pair", "Configure staking part of Lobis").setAction(
  async (args, { ethers, deployments, getNamedAccounts, network }) => {
    const { deployer } = await getNamedAccounts();

    const lobi = await deployments.get("LobiERC20");
    const SUSHI_ROUTER = "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f";
    const SUSHI_FACTORY = "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac";
    const OHM = "0x383518188c0c6d7730d91b2c03a03c837814a899";
    const MAX_ALLOWANCE = BigNumber.from(2).pow(256).sub(1);

    const router = await ethers.getContractAt(ROUTER_ABI, SUSHI_ROUTER);
    const factory = await ethers.getContractAt(SUSHIFACTORY_ABI, SUSHI_FACTORY);
    const ohm = await ethers.getContractAt("LobiERC20", OHM);

    await deployments.execute(
      "LobiERC20",
      { from: deployer },
      "approve",
      SUSHI_ROUTER,
      MAX_ALLOWANCE
    );

    await (await ohm.approve(SUSHI_ROUTER, MAX_ALLOWANCE)).wait();

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x1a80bdc45371fd42ded979d15f224488cfc81b70"],
    });

    const ohmHolder = await ethers.provider.getSigner(
      "0x1a80bdc45371fd42ded979d15f224488cfc81b70"
    );

    await (
      await ohm.connect(ohmHolder).transfer(deployer, "55000000000")
    ).wait();

    const lobiAmount = BigNumber.from(116).mul(BigNumber.from(10).pow(9));
    const ohmAmount = BigNumber.from(55).mul(BigNumber.from(10).pow(9));

    const recipient = "0x719d08f7d8FAb3B0CA8aC45e18572402920f9875";

    const ETH_100 = BigNumber.from(10)
      .mul(BigNumber.from(10).pow(18))
      .toHexString();

    await network.provider.send("hardhat_setBalance", [recipient, ETH_100]);

    await (
      await router.addLiquidity(
        lobi.address,
        ohm.address,
        lobiAmount,
        ohmAmount,
        lobiAmount,
        ohmAmount,
        recipient,
        Math.round(Date.now() / 1000) + 1800
      )
    ).wait();

    const pair = await factory.getPair(lobi.address, ohm.address);
    console.log("pair", pair);
  }
);

task("feed-treasury", "Configure staking part of Lobis").setAction(
  async (args, { ethers, deployments, getNamedAccounts, network }) => {
    const { deployer } = await getNamedAccounts();

    const treasury = await deployments.get("LobisTreasury");
    const CRV_HOLDER = "0x0e33be39b13c576ff48e14392fbf96b02f40cd34";
    const FXS_HOLDER = "0x1e84614543Ab707089CebB022122503462AC51b3";

    const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
    const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";

    const crv = await ethers.getContractAt("DAI", CRV);
    const fxs = await ethers.getContractAt("DAI", FXS);
    const recipient = "0x719d08f7d8FAb3B0CA8aC45e18572402920f9875";

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [CRV_HOLDER],
    });

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [FXS_HOLDER],
    });

    const crvHolder = await ethers.provider.getSigner(CRV_HOLDER);
    const fxsHolder = await ethers.provider.getSigner(FXS_HOLDER);

    await (
      await crv
        .connect(crvHolder)
        .transfer(
          treasury.address,
          BigNumber.from(20000).mul(BigNumber.from(10).pow(18))
        )
    ).wait();

    await (
      await crv
        .connect(crvHolder)
        .transfer(
          recipient,
          BigNumber.from(200000).mul(BigNumber.from(10).pow(18))
        )
    ).wait();

    await (
      await fxs
        .connect(fxsHolder)
        .transfer(
          recipient,
          BigNumber.from(200000).mul(BigNumber.from(10).pow(18))
        )
    ).wait();

    await deployments.execute(
      "LobisTreasury",
      { from: deployer },
      "auditReserves"
    );

    const excess = await deployments.read("LobisTreasury", "excessReserves");

    console.log({
      excess: excess.toString(),
    });
  }
);

task("configure", "Configure all").setAction(async (args, { run }) => {
  await run("configure-staking");
  await run("configure-staked-lobi");
  await run("mint-lobi");
  await run("configure-distributor");
  await run("configure-treasury");

  await run("create-sushi-pair");

  await run("configure-crv-bond");
  await run("configure-fxs-bond");
  await run("configure-ohm-lobi-bond");

  await run("feed-treasury");
});

task("travel", "travel").setAction(async (args, { run, ethers, network }) => {
  const DEPLOYER = "0xBa9ebdC5054A206b3D54D7cb7E7a5ABd2810F6fe";
  const FXS_HOLDER = "0x1e84614543Ab707089CebB022122503462AC51b3";

  const MAX_ALLOWANCE = BigNumber.from(2).pow(256).sub(1);

  const ETH_100 = BigNumber.from(1000)
    .mul(BigNumber.from(10).pow(18))
    .toHexString();

  await network.provider.send("hardhat_setBalance", [DEPLOYER, ETH_100]);
  await network.provider.send("hardhat_setBalance", [FXS_HOLDER, ETH_100]);

  const fxs = await ethers.getContractAt(
    "DAI",
    "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0"
  );

  const contract = await ethers.getContractAt(
    "TokenBondDepository",
    "0xAC0d4C05797F25EfD51B8062a6CeC0F9171f22cB"
  );

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [DEPLOYER],
  });

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [FXS_HOLDER],
  });

  const deployer = await ethers.provider.getSigner(DEPLOYER);
  const fxsHolder = await ethers.provider.getSigner(FXS_HOLDER);

  await fxs
    .connect(fxsHolder)
    .approve("0xAC0d4C05797F25EfD51B8062a6CeC0F9171f22cB", MAX_ALLOWANCE);

  const bondPrice = await contract.bondPriceInUSD();
  const OneHourBlock = 276;
  const hours = 6;

  console.log(`Bond Price before: ${bondPrice.toString() / 1e18} `);

  const terms = await contract.terms();
  const bcvBefore = terms.controlVariable;
  console.log("bcvBefore", bcvBefore.toString());

  let index = 0;
  const bondNecessary = 15;

  await (
    await contract.connect(deployer).setAdjustment(false, 2, 50, 0)
  ).wait();

  while (index < bondNecessary) {
    await (
      await contract
        .connect(fxsHolder)
        .deposit("5000000000000000000", "1000000000000000000000", FXS_HOLDER)
    ).wait();

    index = index + 1;
  }

  console.log(`Bond ${bondNecessary} times`);

  const terms2 = await contract.terms();
  const bcvAfter = terms2.controlVariable;
  console.log("bcvAfter", bcvAfter.toString());

  const current = await ethers.provider.getBlockNumber();
  const last = current + hours * OneHourBlock;

  let curr = current;

  while (curr < last) {
    await ethers.provider.send("evm_mine", []);
    curr = curr + 1;
  }
  const bondPriceAfter = await contract.bondPriceInUSD();
  console.log(
    `Bond Price after ${hours}h: ${bondPriceAfter.toString() / 1e18} `
  );
});

task("create-token-bond-helper", "Create the helper for bonds").setAction(
    async (args, { deployments, getNamedAccounts }) => {
        const { deployer } = await getNamedAccounts();
        const bondCRV = await deployments.get("TokenBondDepositoryCRV");
        const bondFXS = await deployments.get("TokenBondDepositoryFXS");
        const bondOHMLOBI = await deployments.get("TokenBondDepositoryOHMLOBI");
        const tokenBondHelper = await deployments.deploy("TokenBondHelper", {
            args: [[bondCRV.address, bondFXS.address, bondOHMLOBI.address]],
            from: deployer
        });
        console.log("token bond helper deploy", tokenBondHelper.address);
    }
);
