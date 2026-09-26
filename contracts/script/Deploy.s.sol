// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {InstantFun, IERC20} from "../src/InstantFun.sol";
import {TestUSDC} from "../src/mocks/TestUSDC.sol";

interface VmScript {
    function envOr(string calldata name, address defaultValue) external view returns (address);
    function startBroadcast() external;
    function stopBroadcast() external;
}

/// @notice Deploys InstantFun. If USDC_ADDRESS is unset, a TestUSDC faucet token is deployed first (testnet).
///
///   forge script script/Deploy.s.sol --rpc-url bsc_testnet --broadcast --account <keystore-name>
contract Deploy {
    VmScript internal constant vm = VmScript(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (address token, address app) {
        token = vm.envOr("USDC_ADDRESS", address(0));

        vm.startBroadcast();
        if (token == address(0)) token = address(new TestUSDC());
        app = address(new InstantFun(IERC20(token)));
        vm.stopBroadcast();
    }
}
