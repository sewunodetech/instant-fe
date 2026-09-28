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

## Deployments

### BNB testnet (chain 97)

Deployed 2026-09-28 with `script/Deploy.s.sol`, block 133532003.

| Contract | Address | Deploy tx |
| --- | --- | --- |
| InstantFun | [`0x45dd5B746490f93c90Ea5c21212c25C72160BEe5`](https://testnet.bscscan.com/address/0x45dd5B746490f93c90Ea5c21212c25C72160BEe5) | [`0x8b2c…3c98`](https://testnet.bscscan.com/tx/0x8b2c9341e27f913897afb29e4a1a9a0180470ec898859723595513c0645c3c98) |
| TestUSDC (18 decimals) | [`0x50269767cCB832b536e32d99F8bfF53acbAE8C4b`](https://testnet.bscscan.com/address/0x50269767cCB832b536e32d99F8bfF53acbAE8C4b) | [`0xaae1…3277`](https://testnet.bscscan.com/tx/0xaae14d32aaa15ee55e845ebe29326f256d0bb01f3ba28b55be4b9e9fbece3277) |

Deployer: `0xf122a903448e0a43dc275897df2e9e9fccfe972c`

App env for this deployment:

```
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_INSTANT_FUN_ADDRESS=0x45dd5B746490f93c90Ea5c21212c25C72160BEe5
NEXT_PUBLIC_USDC_ADDRESS=0x50269767cCB832b536e32d99F8bfF53acbAE8C4b
NEXT_PUBLIC_USDC_DECIMALS=18
```

The contracts are not verified on BscScan yet.
