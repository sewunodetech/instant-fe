// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title InstantFun
/// @notice On-chain money flows for instant.fun:
///         1. `support` — direct tipping, supporter → creator in one transfer. Nothing is held by the contract.
///         2. Brand campaign escrow — a brand deposits a budget for a campaign, then hand-picks which creators
///            (posts) get paid and how much. Whatever is left can be refunded to the brand once the campaign ends.
///            There is no automatic payout by votes or ranking.
/// @dev Campaign and post ids are the app's UUIDs left-padded into bytes32 (see lib/contracts/ids.ts).
contract InstantFun {
    struct Escrow {
        uint64 endsAt;
        bool closed;
        uint256 funded;
        uint256 paidOut;
        uint256 balance;
    }

    IERC20 public immutable token;

    /// @dev Keyed by brand first so nobody can squat another brand's campaign id.
    mapping(address brand => mapping(bytes32 campaignId => Escrow)) private _escrows;

    uint256 private _locked = 1;

    event SupportSent(address indexed supporter, address indexed creator, bytes32 indexed postId, uint256 amount);
    event EscrowFunded(bytes32 indexed campaignId, address indexed brand, uint256 amount, uint64 endsAt);
    event EscrowPaid(
        bytes32 indexed campaignId, address brand, address indexed creator, bytes32 indexed postId, uint256 amount
    );
    event EscrowRefunded(bytes32 indexed campaignId, address indexed brand, uint256 amount);

    error ZeroAmount();
    error ZeroAddress();
    error SelfSupport();
    error InvalidEndTime();
    error EscrowClosed();
    error EscrowNotFound();
    error CampaignNotEnded();
    error InsufficientEscrow();
    error LengthMismatch();
    error TransferFailed();
    error Reentrancy();

    modifier nonReentrant() {
        if (_locked != 1) revert Reentrancy();
        _locked = 2;
        _;
        _locked = 1;
    }

    constructor(IERC20 token_) {
        if (address(token_) == address(0)) revert ZeroAddress();
        token = token_;
    }

    // ─── Creator support ────────────────────────────────────────────────

    /// @notice Tip a creator for a post. Tokens go straight from the supporter to the creator.
    function support(address creator, bytes32 postId, uint256 amount) external nonReentrant {
        if (creator == address(0)) revert ZeroAddress();
        if (creator == msg.sender) revert SelfSupport();
        if (amount == 0) revert ZeroAmount();

        _safeTransferFrom(msg.sender, creator, amount);
        emit SupportSent(msg.sender, creator, postId, amount);
    }

    // ─── Brand campaign escrow ──────────────────────────────────────────

    /// @notice Open (or top up) a brand campaign escrow.
    /// @param endsAt Unix time after which the brand may refund the remainder. On a top-up it may only extend.
    function fundEscrow(bytes32 campaignId, uint256 amount, uint64 endsAt) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        Escrow storage e = _escrows[msg.sender][campaignId];

        if (e.endsAt == 0) {
            if (endsAt <= block.timestamp) revert InvalidEndTime();
            e.endsAt = endsAt;
        } else {
            if (e.closed) revert EscrowClosed();
            if (endsAt != 0) {
                if (endsAt < e.endsAt) revert InvalidEndTime();
                e.endsAt = endsAt;
            }
        }

        e.funded += amount;
        e.balance += amount;

        _safeTransferFrom(msg.sender, address(this), amount);
        emit EscrowFunded(campaignId, msg.sender, amount, e.endsAt);
    }

    /// @notice Brand pays a creator for a post out of the caller's own escrow for that campaign.
    function payout(bytes32 campaignId, address creator, bytes32 postId, uint256 amount) external nonReentrant {
        Escrow storage e = _brandEscrow(campaignId);
        _payout(e, campaignId, creator, postId, amount);
    }

    /// @notice Pay several creators in one transaction.
    function payoutMany(
        bytes32 campaignId,
        address[] calldata creators,
        bytes32[] calldata postIds,
        uint256[] calldata amounts
    ) external nonReentrant {
        if (creators.length != postIds.length || creators.length != amounts.length) revert LengthMismatch();
        Escrow storage e = _brandEscrow(campaignId);
        for (uint256 i = 0; i < creators.length; i++) {
            _payout(e, campaignId, creators[i], postIds[i], amounts[i]);
        }
    }

    /// @notice After the campaign ends, return the unspent budget to the brand and close the escrow.
    function refund(bytes32 campaignId) external nonReentrant {
        Escrow storage e = _brandEscrow(campaignId);
        if (block.timestamp < e.endsAt) revert CampaignNotEnded();

        uint256 amount = e.balance;
        e.balance = 0;
        e.closed = true;

        if (amount > 0) _safeTransfer(msg.sender, amount);
        emit EscrowRefunded(campaignId, msg.sender, amount);
    }

    function getEscrow(address brand, bytes32 campaignId) external view returns (Escrow memory) {
        return _escrows[brand][campaignId];
    }

    // ─── Internals ──────────────────────────────────────────────────────

    function _brandEscrow(bytes32 campaignId) private view returns (Escrow storage e) {
        e = _escrows[msg.sender][campaignId];
        if (e.endsAt == 0) revert EscrowNotFound();
        if (e.closed) revert EscrowClosed();
    }

    function _payout(Escrow storage e, bytes32 campaignId, address creator, bytes32 postId, uint256 amount) private {
        if (creator == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (amount > e.balance) revert InsufficientEscrow();

        e.balance -= amount;
        e.paidOut += amount;

        _safeTransfer(creator, amount);
        emit EscrowPaid(campaignId, msg.sender, creator, postId, amount);
    }

    /// @dev Accepts tokens that return nothing (USDT-style) as well as ones returning a bool.
    function _safeTransfer(address to, uint256 amount) private {
        (bool ok, bytes memory data) = address(token).call(abi.encodeCall(IERC20.transfer, (to, amount)));
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert TransferFailed();
    }

    function _safeTransferFrom(address from, address to, uint256 amount) private {
        (bool ok, bytes memory data) =
            address(token).call(abi.encodeCall(IERC20.transferFrom, (from, to, amount)));
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert TransferFailed();
    }
}
