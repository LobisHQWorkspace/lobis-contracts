const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("wLOBI", async function () {

    let sLOBI;
    let wLOBI;
    let owner;

    this.beforeEach( async function () {
        /* Mock owner address */
        [owner] = await ethers.getSigners();

        /* Deploy sLOBI contract required for indexing wLOBI */
        const sLOBIFactory = await ethers.getContractFactory("StakedLobiERC20");
        sLOBI = await sLOBIFactory.deploy();
        await sLOBI.deployed();

        /* Deploy wLOBI contract */
        const wLOBIFactory = await ethers.getContractFactory("wLOBI");
        wLOBI = await wLOBIFactory.deploy(owner.address, owner.address, sLOBI.address);
        await wLOBI.deployed();
    });

    it("wLOBI index function should return the same as sLOBI", async function () {
        const index = 10;

        /* Set sLOBI index to arbitrary value */
        await sLOBI.setIndex(index);
        
        expect(await wLOBI.index()).to.equal(index);
    });

    it("wLOBI balance from should return #sLOBI/INDEX", async function () {
        const ammount = 10;
        const index = 5;
        const decimals = await wLOBI.decimals();
        const expected = (ammount / index) * (10**decimals);

        /* Set sLOBI index to arbitrary value */
        await sLOBI.setIndex(index);
        
        expect((await wLOBI.balanceTo(ammount)).toString()).to.equal(expected.toString());
    });

    it("sLOBI balance from should return #wLOBI*INDEX", async function () {
        const index = 2;
        const decimals = await wLOBI.decimals();
        const ammount = 1 * 10**decimals;
        const expected = (ammount * index) / (10**decimals);

        /* Set sLOBI index to arbitrary value */
        await sLOBI.setIndex(index);
        
        expect(await wLOBI.balanceFrom(ammount.toString())).to.equal(expected);
    });  
});