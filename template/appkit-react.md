---
target: packages/appkit-react/README.md
---

# @ton/appkit-react

React components and hooks for AppKit.

## Installation

```bash
pnpm add @ton/appkit @ton/appkit-react
```

## Initialization

Wrap your application in `AppKitProvider` and pass the `AppKit` instance.

> [!NOTE]
> Don't forget to import styles from `@ton/appkit-react/styles.css`.

%%demo/examples/src/appkit#APPKIT_REACT_INIT%%

## Swap

AppKit supports swapping assets through `OmnistonSwapProvider`.

### Installation

```bash
pnpm add @ston-fi/omniston-sdk
```

### Setup

Initialize `AppKit` with `OmnistonSwapProvider`:

%%demo/examples/src/appkit/swap#SWAP_PROVIDER_INIT%%

### Hooks

Use `useSwapQuote` to get a quote and `useBuildSwapTransaction` to build the transaction.

See [Swap Hooks](./docs/hooks.md#swap) for usage examples.

## Migration from TonConnect UI

If you are using `@tonconnect/ui-react` and want to migrate to AppKit gradually, you can use `TonConnectBridge`.

> [!IMPORTANT]
> This bridge is **deprecated** and should only be used for temporary migration. It allows you to use `@tonconnect/ui-react` hooks (like `useTonAddress`, `useTonWallet`, etc.) while using AppKit as the underlying provider.

First, wrap your application in `TonConnectBridge` inside `AppKitProvider`:

%%demo/examples/src/appkit#APPKIT_REACT_TONCONNECT%%

Then you can use standard TonConnect hooks in your components:

%%demo/examples/src/appkit#APPKIT_REACT_TONCONNECT_HOOKS%%

## Documentation

- [Hooks](./docs/hooks.md): React hooks for wallet connection, state, and data fetching.
- [Components](./docs/components.md): UI components for AppKit.

## License

MIT
