---
"@ton/walletkit": patch
---

Rename the native asset from TON to GRAM across the public API. This is a breaking change for consumers that reference the old names or values:

- The native token's `TokenInfo` / jetton metadata now reports `name: 'Gram'` and `symbol: 'GRAM'`.
- Tonstakers staking metadata now exposes `stakeToken.ticker: 'GRAM'`.
- Human-readable transaction previews now read "Gram Transfer", and amounts are labelled `GRAM` (e.g. `1.5 GRAM`) instead of `TON`.

Removed the `HumanReadableTx` type from the public exports.
