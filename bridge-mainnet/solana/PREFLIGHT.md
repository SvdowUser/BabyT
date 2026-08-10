# BabyT Solana Mainnet OFT Adapter — Preflight Only

This file records the unfinished Work step without deploying anything.

## Fixed production inputs

- Canonical token: BabyT on Solana
- Mint: `Bo3sVJY52FNDBxT3uDN92FcL277fXriy1Un7dXuQpump`
- Token standard: Token-2022
- Local decimals: 6
- Solana LayerZero V2 mainnet EID: `30168`
- Robinhood LayerZero V2 mainnet EID: `30416`
- Bridge model on Solana: OFT Adapter / lock-unlock
- Robinhood representation: OFT / burn-mint

## Why Adapter mode

BabyT already exists on Solana and its mint authority is disabled. The mint-and-burn adapter path requires transferring mint authority, so this production path uses the existing-token OFT Adapter and keeps Solana as the canonical supply.

## Safety gate

Do **not** run a mainnet deployment, wallet signature, bridge transfer, peer wiring, or liquidity-pool creation from this repository yet.

The next verifiable-build sequence is intentionally split because the Solana OFT program ID comes from a keypair. That keypair must never be committed to GitHub.

### 1. Generate the OFT program ID in a secure local environment

```bash
anchor keys sync -p oft
anchor keys list
```

Keep `target/deploy/oft-keypair.json` secret and outside version control.

### 2. Produce the verifiable program build

```bash
anchor build -v -e OFT_ID=<OFT_PROGRAM_ID>
```

Expected artifact:

```text
target/verifiable/oft.so
```

### 3. Only after the program is reviewed, prepare the existing-token adapter

```bash
pnpm hardhat lz:oft-adapter:solana:create \
  --eid 30168 \
  --program-id <OFT_PROGRAM_ID> \
  --mint Bo3sVJY52FNDBxT3uDN92FcL277fXriy1Un7dXuQpump \
  --token-program <TOKEN_2022_PROGRAM_ID>
```

This command is recorded here for review; it must not be executed until the program ID, deployed program, owner/delegate and transaction contents have been checked.

### 4. Wiring remains blocked

After both mainnet deployments exist and have been independently checked, the LayerZero Solana pathway needs its configuration accounts initialized and the two OApps wired as peers. The standard LayerZero tasks are:

```bash
npx hardhat lz:oft:solana:init-config --oapp-config layerzero.config.ts
pnpm hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

These are **not** authorized for execution yet.

## Release gate before any real token movement

The following must all be true:

- EVM contract CI is green.
- Solana `target/verifiable/oft.so` is reproducibly built and reviewed.
- Solana OFT Store/escrow and Robinhood OFT addresses are known and verified.
- Both peer values and LayerZero security/executor configuration are reviewed.
- Emergency controls and owner/delegate addresses are confirmed.
- A tiny controlled bridge test succeeds before any liquidity is added.
- BabyT/ETH pool creation remains the final step, not the bridge setup step.
