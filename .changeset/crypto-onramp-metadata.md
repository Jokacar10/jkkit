---
'@ton/walletkit': major
'@ton/appkit': major
'@ton/appkit-react': major
---

Add crypto-onramp provider `getMetadata()` (synchronous).

- `@ton/walletkit`:
    - `CryptoOnrampProvider.getMetadata()` and `CryptoOnrampProviderInterface.getMetadata()` return `CryptoOnrampProviderMetadata` synchronously, matching `SwapProvider`. Concrete `DecentCryptoOnrampProvider` and `LayerswapCryptoOnrampProvider` return their static metadata directly.
    - `CryptoOnrampManager` exposes a synchronous `getMetadata(providerId?)` proxy with the existing `try/catch + log.debug` pattern.
- `@ton/appkit`:
    - New synchronous action `getCryptoOnrampProviderMetadata`.
- `@ton/appkit-react`:
    - New hook `useCryptoOnrampProviderMetadata` that returns the metadata directly, resolved off the registered providers (`undefined` for an unknown id, kept fresh as providers register).
    - `CryptoOnrampContext` exposes `providersMetadata` (`Record<providerId, metadata | undefined>`); the settings modal renders each provider with a `providerId` fallback.
