// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { BabyTOFT } from "../BabyTOFT.sol";

contract BabyTOFTHarness is BabyTOFT {
    constructor(address endpoint, address delegate) BabyTOFT(endpoint, delegate) {}

    function exposedCredit(address to, uint256 amountLD, uint32 srcEid) external returns (uint256) {
        return _credit(to, amountLD, srcEid);
    }

    function exposedDebit(
        address from,
        uint256 amountLD,
        uint256 minAmountLD,
        uint32 dstEid
    ) external returns (uint256 amountSentLD, uint256 amountReceivedLD) {
        return _debit(from, amountLD, minAmountLD, dstEid);
    }
}
