// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/Address.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IwLOBI.sol";

contract wLOBIWrappingHelper {

    /* ========== DEPENDENCIES ========== */

    using Address for address;
    using SafeMath for uint256;

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
        _safeTransferFrom(sLOBI, msg.sender, address(this), _amount);
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
        _safeTransfer(sLOBI, _to, sBalance_);
    }

    /* ========== ADMIN FUNCTIONS ========== */

    function setwLOBI(address _wLOBI) external onlyApproved {
        require(address(wLOBI) == address(0), "Already set");
        require(_wLOBI != address(0), "Zero address: wLOBI");
        wLOBI = IwLOBI(_wLOBI);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /** 
     *  @notice Transfers tokens to the given destination
     *  @notice Errors with 'TRANSFER_FROM_FAILED' if transfer fails
     *  @notice Safe IERC20 and ETH transfer library that safely handles missing return values.
     *  @notice Modified from Uniswap (https://github.com/Uniswap/uniswap-v3-periphery/blob/main/contracts/libraries/TransferHelper.sol) (Taken from Olympus)
     *  @param token The Contract of the token that is being transfered
     *  @param to The destination address of the transfer
     *  @param amount The amount to be transferred
     */
    function _safeTransfer(IERC20 token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );

        require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FAILED");
    }

    /** 
     *  @notice Transfers tokens from the targeted address to the given destination
     *  @notice Errors with 'TRANSFER_FROM_FAILED' if transfer fails
     *  @notice Safe IERC20 and ETH transfer library that safely handles missing return values.
     *  @notice Modified from Uniswap (https://github.com/Uniswap/uniswap-v3-periphery/blob/main/contracts/libraries/TransferHelper.sol) (Taken from Olympus)
     *  @param from The source adress of the transfer
     *  @param token The Contract of the token that is being transfered
     *  @param to The destination address of the transfer
     *  @param amount The amount to be transferred
     */
    function _safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );

        require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FROM_FAILED");
    }

}