// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/Address.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IwLOBI.sol";

contract wLOBIWrappingHelper {

    /* ========== DEPENDENCIES ========== */

    using Address for address;
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IwLOBI;

    /* ========== MODIFIERS ========== */

    modifier onlyApproved() {
        require(msg.sender == approved, "Only approved");
        _;
    }

    /* ========== STATE VARIABLES ========== */
    IERC20 private sLOBI;
    IwLOBI private wLOBI;
    address private approved;

    /* ========== CONSTRUCTOR ========== */
    constructor(address _owner, address _sLOBI) {
        require(_sLOBI != address(0), "Zero address: sLOBI");
        require(_owner != address(0), "Zero address: owner");
        sLOBI = IERC20(_sLOBI);
        approved = _owner;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @notice convert _amount sLOBI into wBalance_ wLOBI
     * @param _to address
     * @param _amount uint
     * @return wBalance_ uint
     */
    function wrap(address _to, uint256 _amount) external returns (uint256 wBalance_) {
        sLOBI.safeTransferFrom(msg.sender, address(this), _amount);
        wBalance_ = wLOBI.balanceTo(_amount);
        wLOBI.mint(_to, wBalance_);
    }

    /**
     * @notice convert _amount wLOBI into sBalance_ sLOBI
     * @param _to address
     * @param _amount uint
     * @return sBalance_ uint
     */
    function unwrap(address _to, uint256 _amount) external returns (uint256 sBalance_) {
        wLOBI.burn(msg.sender, _amount);
        sBalance_ = wLOBI.balanceFrom(_amount);
        sLOBI.safeTransfer(_to, sBalance_);
    }

    /* ========== ADMIN FUNCTIONS ========== */

    function setwLOBI(address _wLOBI) external onlyApproved {
        require(address(wLOBI) == address(0), "Already set");
        require(_wLOBI != address(0), "Zero address: wLOBI");
        wLOBI = IwLOBI(_wLOBI);
    }
}