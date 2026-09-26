// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev The handful of Foundry cheatcodes the tests need, so the suite runs without forge-std.
interface Vm {
    function prank(address sender) external;
    function startPrank(address sender) external;
    function stopPrank() external;
    function warp(uint256 timestamp) external;
    function expectRevert(bytes4 selector) external;
    function expectEmit(bool t1, bool t2, bool t3, bool data, address emitter) external;
}

abstract contract CheatTest {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function assertEq(uint256 a, uint256 b, string memory what) internal pure {
        if (a != b) revert(string.concat(what, ": values differ"));
    }

    function assertEq(address a, address b, string memory what) internal pure {
        if (a != b) revert(string.concat(what, ": addresses differ"));
    }

    function assertTrue(bool v, string memory what) internal pure {
        if (!v) revert(what);
    }
}
