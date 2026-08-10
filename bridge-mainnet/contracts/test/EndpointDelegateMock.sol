// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/// @dev Minimal constructor-time mock. BabyTOFT only calls setDelegate during deployment
///      in these unit tests; no cross-chain message is sent.
contract EndpointDelegateMock {
    address public delegate;

    function setDelegate(address _delegate) external {
        delegate = _delegate;
    }
}
