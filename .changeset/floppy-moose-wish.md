---
'@ton/walletkit': patch
'@ton/appkit': patch
'@ton/appkit-react': patch
---

- Added support for Tetra network and `ApiClientTonApi` implementation for WalletKit.
- Added `getDefaultNetwork`, `setDefaultNetwork` and `watchDefaultNetwork` in AppKit.
- Internal refactoring in WalletKit API clients via abstract `BaseApiClient`.
- `ApiClient` `sendBoc` now returns Hex strings (`0x`).
- Fixed infinite re-render in `useNetworks` hook.
