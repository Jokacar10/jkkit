---
'@ton/walletkit': patch
'@ton/appkit': patch
'@ton/appkit-react': patch
---

Unify DeFi error handling so the public API always throws a typed `DefiError`.

- Added `DefiErrorCode.Unknown` and a `toDefiError(error, message)` helper. The new code is re-exported through `@ton/appkit` and `@ton/appkit-react`, and the behaviour below applies to swap/staking/onramp/gasless calls made through them.
- All DeFi managers (`SwapManager`, `StakingManager`, `CryptoOnrampManager`, `GaslessManager`) now handle errors the same way: log the failure and re-throw the provider's typed error unchanged, wrapping anything that is not already a `DefiError` in a `DefiError` with the `Unknown` code (the original error is preserved in `details`). A call that fails therefore always surfaces a `DefiError` — either a provider subclass (`SwapError` / `StakingError` / `CryptoOnrampError` / `GaslessError`) or `DefiError(Unknown)`.
- Base `DefiManager` operations (`registerProvider`, `setDefaultProvider`, `getProvider`) throw `DefiError` (e.g. `GaslessManager.setDefaultProvider` for an unknown id now throws `DefiError` instead of `GaslessError`).
- Providers now throw typed errors consistently. Provider-factory configuration failures (`createTonstakersProvider` / `createTonApiGaslessProvider` with no eligible networks) throw `DefiError(InvalidParams)`, and runtime validation (e.g. invalid TonAPI staking APY data) throws `StakingError` — these previously threw a generic `Error`.
- `@ton/appkit-react` maps the new `Unknown` code to a generic "Something went wrong" message (`defi.genericError`) so widgets show a sensible message instead of a context-specific fallback.
