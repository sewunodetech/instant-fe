// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CheatTest} from "./Cheats.sol";
import {InstantFun, IERC20} from "../src/InstantFun.sol";
import {TestUSDC} from "../src/mocks/TestUSDC.sol";

contract InstantFunTest is CheatTest {
    event SupportSent(address indexed supporter, address indexed creator, bytes32 indexed postId, uint256 amount);
    event EscrowPaid(
        bytes32 indexed campaignId, address brand, address indexed creator, bytes32 indexed postId, uint256 amount
    );

    TestUSDC usdc;
    InstantFun app;

    address brand = address(0xB2A4D);
    address fan = address(0xFA4);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    bytes32 constant CAMPAIGN = bytes32(uint256(0xC0FFEE));
    bytes32 constant POST_A = bytes32(uint256(0xA));
    bytes32 constant POST_B = bytes32(uint256(0xB));

    uint64 endsAt;

    function setUp() public {
        usdc = new TestUSDC();
        app = new InstantFun(IERC20(address(usdc)));
        endsAt = uint64(block.timestamp + 7 days);

        usdc.mint(brand, 1_000 ether);
        usdc.mint(fan, 100 ether);

        vm.prank(brand);
        usdc.approve(address(app), type(uint256).max);
        vm.prank(fan);
        usdc.approve(address(app), type(uint256).max);
    }

    // ─── support ────────────────────────────────────────────────────────

    function test_support_goesStraightToCreator() public {
        vm.expectEmit(true, true, true, true, address(app));
        emit SupportSent(fan, alice, POST_A, 5 ether);

        vm.prank(fan);
        app.support(alice, POST_A, 5 ether);

        assertEq(usdc.balanceOf(alice), 5 ether, "creator balance");
        assertEq(usdc.balanceOf(fan), 95 ether, "fan balance");
        assertEq(usdc.balanceOf(address(app)), 0, "contract holds nothing");
    }

    function test_support_rejectsSelfAndZero() public {
        vm.prank(fan);
        vm.expectRevert(InstantFun.SelfSupport.selector);
        app.support(fan, POST_A, 1 ether);

        vm.prank(fan);
        vm.expectRevert(InstantFun.ZeroAmount.selector);
        app.support(alice, POST_A, 0);

        vm.prank(fan);
        vm.expectRevert(InstantFun.ZeroAddress.selector);
        app.support(address(0), POST_A, 1 ether);
    }

    function test_support_failsWithoutBalance() public {
        vm.prank(alice);
        vm.expectRevert(InstantFun.TransferFailed.selector);
        app.support(bob, POST_A, 1 ether);
    }

    // ─── escrow ─────────────────────────────────────────────────────────

    function _fund(uint256 amount) internal {
        vm.prank(brand);
        app.fundEscrow(CAMPAIGN, amount, endsAt);
    }

    function test_fundEscrow_locksBudget() public {
        _fund(500 ether);

        InstantFun.Escrow memory e = app.getEscrow(brand, CAMPAIGN);
        assertEq(e.funded, 500 ether, "funded");
        assertEq(e.balance, 500 ether, "balance");
        assertEq(uint256(e.endsAt), uint256(endsAt), "endsAt");
        assertEq(usdc.balanceOf(address(app)), 500 ether, "contract balance");
    }

    function test_fundEscrow_rejectsPastEnd() public {
        vm.prank(brand);
        vm.expectRevert(InstantFun.InvalidEndTime.selector);
        app.fundEscrow(CAMPAIGN, 1 ether, uint64(block.timestamp));
    }

    function test_topUp_canOnlyExtend() public {
        _fund(100 ether);

        vm.prank(brand);
        vm.expectRevert(InstantFun.InvalidEndTime.selector);
        app.fundEscrow(CAMPAIGN, 1 ether, endsAt - 1);

        vm.prank(brand);
        app.fundEscrow(CAMPAIGN, 50 ether, endsAt + 1 days);

        InstantFun.Escrow memory e = app.getEscrow(brand, CAMPAIGN);
        assertEq(e.funded, 150 ether, "funded");
        assertEq(uint256(e.endsAt), uint256(endsAt + 1 days), "extended");
    }

    function test_payout_brandPicksCreators() public {
        _fund(300 ether);

        vm.expectEmit(true, true, true, true, address(app));
        emit EscrowPaid(CAMPAIGN, brand, alice, POST_A, 120 ether);

        vm.prank(brand);
        app.payout(CAMPAIGN, alice, POST_A, 120 ether);

        assertEq(usdc.balanceOf(alice), 120 ether, "alice paid");
        InstantFun.Escrow memory e = app.getEscrow(brand, CAMPAIGN);
        assertEq(e.balance, 180 ether, "balance");
        assertEq(e.paidOut, 120 ether, "paidOut");
    }

    function test_payout_onlyBrand() public {
        _fund(300 ether);
        vm.prank(alice);
        vm.expectRevert(InstantFun.EscrowNotFound.selector);
        app.payout(CAMPAIGN, alice, POST_A, 1 ether);
    }

    function test_payout_cannotExceedBalance() public {
        _fund(10 ether);
        vm.prank(brand);
        vm.expectRevert(InstantFun.InsufficientEscrow.selector);
        app.payout(CAMPAIGN, alice, POST_A, 11 ether);
    }

    function test_payout_unknownCampaign() public {
        vm.prank(brand);
        vm.expectRevert(InstantFun.EscrowNotFound.selector);
        app.payout(CAMPAIGN, alice, POST_A, 1 ether);
    }

    function test_payoutMany() public {
        _fund(300 ether);

        address[] memory creators = new address[](2);
        creators[0] = alice;
        creators[1] = bob;
        bytes32[] memory posts = new bytes32[](2);
        posts[0] = POST_A;
        posts[1] = POST_B;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 ether;
        amounts[1] = 50 ether;

        vm.prank(brand);
        app.payoutMany(CAMPAIGN, creators, posts, amounts);

        assertEq(usdc.balanceOf(alice), 100 ether, "alice");
        assertEq(usdc.balanceOf(bob), 50 ether, "bob");
        assertEq(app.getEscrow(brand, CAMPAIGN).balance, 150 ether, "remaining");
    }

    function test_payoutMany_lengthMismatch() public {
        _fund(300 ether);
        address[] memory creators = new address[](2);
        bytes32[] memory posts = new bytes32[](1);
        uint256[] memory amounts = new uint256[](2);

        vm.prank(brand);
        vm.expectRevert(InstantFun.LengthMismatch.selector);
        app.payoutMany(CAMPAIGN, creators, posts, amounts);
    }

    function test_payout_allowedAfterEndUntilRefund() public {
        _fund(100 ether);
        vm.warp(endsAt + 1);

        vm.prank(brand);
        app.payout(CAMPAIGN, alice, POST_A, 40 ether);
        assertEq(usdc.balanceOf(alice), 40 ether, "paid after end");
    }

    function test_refund_onlyAfterEnd() public {
        _fund(100 ether);

        vm.prank(brand);
        vm.expectRevert(InstantFun.CampaignNotEnded.selector);
        app.refund(CAMPAIGN);

        vm.prank(brand);
        app.payout(CAMPAIGN, alice, POST_A, 30 ether);

        vm.warp(endsAt);
        uint256 before = usdc.balanceOf(brand);
        vm.prank(brand);
        app.refund(CAMPAIGN);

        assertEq(usdc.balanceOf(brand) - before, 70 ether, "remainder refunded");
        InstantFun.Escrow memory e = app.getEscrow(brand, CAMPAIGN);
        assertTrue(e.closed, "closed");
        assertEq(e.balance, 0, "empty");
        assertEq(usdc.balanceOf(address(app)), 0, "contract empty");
    }

    function test_closedEscrow_rejectsEverything() public {
        _fund(100 ether);
        vm.warp(endsAt);
        vm.prank(brand);
        app.refund(CAMPAIGN);

        vm.startPrank(brand);
        vm.expectRevert(InstantFun.EscrowClosed.selector);
        app.payout(CAMPAIGN, alice, POST_A, 1 ether);
        vm.expectRevert(InstantFun.EscrowClosed.selector);
        app.fundEscrow(CAMPAIGN, 1 ether, 0);
        vm.expectRevert(InstantFun.EscrowClosed.selector);
        app.refund(CAMPAIGN);
        vm.stopPrank();
    }

    function test_refund_onlyBrand() public {
        _fund(100 ether);
        vm.warp(endsAt);
        vm.prank(fan);
        vm.expectRevert(InstantFun.EscrowNotFound.selector);
        app.refund(CAMPAIGN);
    }

    function test_campaignIdCannotBeSquatted() public {
        // Someone else funds an escrow under the same campaign id first...
        vm.prank(fan);
        app.fundEscrow(CAMPAIGN, 20 ether, endsAt);

        // ...the real brand can still open theirs, and the two never mix.
        _fund(100 ether);
        assertEq(app.getEscrow(fan, CAMPAIGN).balance, 20 ether, "fan escrow");
        assertEq(app.getEscrow(brand, CAMPAIGN).balance, 100 ether, "brand escrow");

        vm.prank(brand);
        vm.expectRevert(InstantFun.InsufficientEscrow.selector);
        app.payout(CAMPAIGN, alice, POST_A, 101 ether);

        vm.prank(fan);
        vm.expectRevert(InstantFun.InsufficientEscrow.selector);
        app.payout(CAMPAIGN, alice, POST_A, 21 ether);
    }
}
