const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("wLOBIWrappingHelper", async function () {

    let sLOBI;
    let wLOBI;
    let owner;
    let sut;

    this.beforeEach( async function () {
        /* Mock owner address */
        [owner] = await ethers.getSigners();

        /* Deploy sLOBI contract required for indexing wLOBI */
        const sLOBIFactory = await ethers.getContractFactory("StakedLobiERC20");
        sLOBI = await sLOBIFactory.deploy();
        await sLOBI.deployed();

        /* Deploy wLOBIWrappingHelper */
        const wLOBIWrappingHelperFactory = await ethers.getContractFactory("wLOBIWrappingHelper");
        sut = await wLOBIWrappingHelperFactory.deploy(owner.address, sLOBI.address);
        await sut.deployed();

        /* Deploy wLOBI contract */
        const wLOBIFactory = await ethers.getContractFactory("MockwLOBI");
        wLOBI = await wLOBIFactory.deploy(sLOBI.address);
        await wLOBI.deployed();

        /* Set wLOBI address */
        await sut.setwLOBI(wLOBI.address);

        /*Add sLOBI balance to Wrapping Contract*/
        await sLOBI.initialize(sut.address);

        /*Aprove wrapping contract (to max)*/
        await sLOBI.approve(sut.address, 9999999999);
    });

    it("wrap -> unwrap operation should be a 0 sum change.", async function () {
        
        const index = 1;
        const sLOBIAmmount = 1;
        const wLOBIAmmount = sLOBIAmmount * 10**(await wLOBI.decimals()) / index;

        /* Set sLOBI index to arbitrary value */
        await sLOBI.setIndex(index);

        await wLOBI.mint(owner.address, wLOBIAmmount.toString());
       
        /* Unwrap user owned wLOBI */
        await sut.unwrap(owner.address, wLOBIAmmount.toString());
        
        expect(await sLOBI.balanceOf(owner.address)).to.equal(sLOBIAmmount);
        expect(await wLOBI.balanceOf(owner.address)).to.equal(0);

        /* Wrap owned sLOBI*/
        await sut.wrap(owner.address, 1);

        expect(await sLOBI.balanceOf(owner.address)).to.equal(0);
        expect((await wLOBI.balanceOf(owner.address)).toString()).to.equal(wLOBIAmmount.toString());
    });
});