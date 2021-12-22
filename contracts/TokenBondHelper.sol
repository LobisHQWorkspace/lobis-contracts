// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./TokenBondDepository.sol";

contract TokenBondHelper is Ownable {
    mapping(TokenBondDepository => bool) internal _tokenBonds;

    constructor(TokenBondDepository[] memory _tokenBondDepositories){
        for(uint256 i=0; i < _tokenBondDepositories.length; i++){
            _tokenBonds[_tokenBondDepositories[i]] = true;
        }
    }

    function updateTokenBondDepository(TokenBondDepository[] calldata _tokenBondDepository, bool[] calldata status) external onlyPolicy returns (bool){
        require(_tokenBondDepository.length == status.length, "mismatch length");
        for(uint256 i=0; i < _tokenBondDepository.length; i++){
            _tokenBonds[_tokenBondDepository[i]] = status[i];
        }
        return true;
    }

    function redeemMany(address _recipient, bool _stake, TokenBondDepository[] calldata _tokenBondDepository) external returns (bool) {
        for(uint256 i=0; i < _tokenBondDepository.length; i++){
            require(_tokenBonds[_tokenBondDepository[i]], "Token bond not supported");
            _tokenBondDepository[i].redeem(_recipient, _stake);
        }
        return true;
    }
}
