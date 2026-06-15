---
"@ton/walletkit": patch
---

Rebrand the native asset display from TON to GRAM:

- The native token's `TokenInfo` / jetton metadata now reports `name: 'Gram'` and `symbol: 'GRAM'`.
- Tonstakers staking metadata now exposes `stakeToken.ticker: 'GRAM'`.
- Human-readable transaction previews now read "Gram Transfer", and amounts are labelled `GRAM` (e.g. `1.5 GRAM`) instead of `TON`.

Also dropped the unused `HumanReadableTx` type from the public exports.
