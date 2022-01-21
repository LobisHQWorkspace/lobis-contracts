// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.7.5;

import "../libraries/SafeMath.sol";
import "../libraries/Address.sol";

import "../interfaces/Iindexable.sol";
import "../interfaces/IwLOBI.sol";
import "../types/ERC20.sol";

/* 
    This is a Mock of wLOBI used only for unit testing, DO NOT USE IN A PRODUCTION ENVIRONMENT.
 */
contract MockwLOBI is IwLOBI, ERC20 {

    /* ========== DEPENDENCIES ========== */

    using Address for address;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    Iindexable public sLobiIndex;
    address public approved; // minter
    bool public migrated;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _sLOBI)
        ERC20("Mock Governance LOBI", "fakewLOBI", 18)
    {
        require(_sLOBI != address(0), "Zero address: sLOBI");
        sLobiIndex = Iindexable(_sLOBI);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
        @notice mint wLOBI
        @param _to address
        @param _amount uint
     */
    function mint(address _to, uint256 _amount) external override {
        _mint(_to, _amount);
    }

    /**
        @notice burn wLOBI
        @param _from address
        @param _amount uint
     */
    function burn(address _from, uint256 _amount) external override {
        _burn(_from, _amount);
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice pull index from sLOBI token
     */
    function index() public view override returns (uint256) {
        return sLobiIndex.index();
    }

    /**
        @notice converts wLOBI amount to LOBI
        @param _amount uint
        @return uint
     */
    function balanceFrom(uint256 _amount) public view override returns (uint256) {
        return _amount.mul(index()).div(10**decimals());
    }

    /**
        @notice converts LOBI amount to wLOBI
        @param _amount uint
        @return uint
     */
    function balanceTo(uint256 _amount) public view override returns (uint256) {
        return _amount.mul(10**decimals()).div(index());
    }

}
