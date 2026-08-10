// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { OFTCore } from "@layerzerolabs/oft-evm/contracts/OFTCore.sol";

/// @notice Six-decimal OFT implementation for the Robinhood representation of BabyT.
/// @dev Solana remains the canonical supply. This contract starts with zero supply and
///      has no externally callable mint function. Cross-chain credit is the only mint path.
abstract contract OFT6 is OFTCore, ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) ERC20(_name, _symbol) OFTCore(6, _lzEndpoint, _delegate) {}

    function decimals() public pure virtual override returns (uint8) {
        return 6;
    }

    function token() public view returns (address) {
        return address(this);
    }

    function approvalRequired() external pure virtual returns (bool) {
        return false;
    }

    function _debit(
        address _from,
        uint256 _amountLD,
        uint256 _minAmountLD,
        uint32 _dstEid
    ) internal virtual override returns (uint256 amountSentLD, uint256 amountReceivedLD) {
        (amountSentLD, amountReceivedLD) = _debitView(_amountLD, _minAmountLD, _dstEid);
        _burn(_from, amountSentLD);
    }

    function _credit(
        address _to,
        uint256 _amountLD,
        uint32 /* _srcEid */
    ) internal virtual override returns (uint256 amountReceivedLD) {
        if (_to == address(0)) _to = address(0xdead);
        _mint(_to, _amountLD);
        return _amountLD;
    }
}

contract BabyTOFT is OFT6, Pausable {
    constructor(address _lzEndpoint, address _delegate)
        OFT6("BabyT", "BabyT", _lzEndpoint, _delegate)
        Ownable(_delegate)
    {}

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @dev Pausing blocks ordinary ERC-20 transfers as well as the OFT burn/mint paths,
    ///      because both _burn() and _mint() route through ERC20._update().
    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }
}
