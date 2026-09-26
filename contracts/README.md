# InstantFun contracts

`src/InstantFun.sol` handles all money on instant.fun:

- `support(creator, postId, amount)`: a direct tip. USDC goes from the supporter to the creator in one transfer, and the contract never holds it.
- Brand campaign escrow: `fundEscrow` locks a brand's budget. `payout` / `payoutMany` pay creators the brand picks. `refund` returns what is left to the brand after `endsAt`. Escrows are keyed by `(brand, campaignId)`, so nobody can squat another brand's campaign id.

Ids are app UUIDs left-padded into `bytes32` (`lib/contracts/instant-fun.ts`). The backend indexes transactions from their events (`lib/services/chain-sync.service.ts`) and never trusts amounts sent by the client.

## Test

```bash
forge test
```

The suite has no dependencies: `test/Cheats.sol` declares the few cheatcodes it uses.

## Deploy (BNB testnet)

```bash
forge script script/Deploy.s.sol --rpc-url bsc_testnet --broadcast --account <keystore>
```

If `USDC_ADDRESS` is unset, the script first deploys `TestUSDC`, an 18-decimal faucet token where anyone can `mint` up to 1,000 per call. Then set these in the app's `.env`:

```
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_INSTANT_FUN_ADDRESS=<InstantFun>
NEXT_PUBLIC_USDC_ADDRESS=<token>
NEXT_PUBLIC_USDC_DECIMALS=18
BLOCKCHAIN_RPC_URL=<BNB testnet RPC>
```

Wallets need tBNB for gas.
