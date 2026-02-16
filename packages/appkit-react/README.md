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

```tsx
import { AppKit, Network } from '@ton/appkit';
import { AppKitProvider } from '@ton/appkit-react';
import { TonConnectConnector } from '@ton/appkit/tonconnect';
import type { FC } from 'react';

// Import styles
import '@ton/appkit-react/styles.css';

// Initialize AppKit
const appKit = new AppKit({
    networks: {
        [Network.mainnet().chainId]: {
            apiClient: {
                url: 'https://toncenter.com',
                key: 'your-key',
            },
        },
        // Optional: add testnet
        // [Network.testnet().chainId]: {
        //     apiClient: {
        //         url: 'https://testnet.toncenter.com',
        //         key: 'your-key',
        //     },
        // },
    },
    connectors: [
        new TonConnectConnector({
            tonConnectOptions: { manifestUrl: 'your-manifest-url' },
        }),
    ],
});

export const App: FC = () => {
    return <AppKitProvider appKit={appKit}>{/* <AppContent /> */}</AppKitProvider>;
};
```

## Swap

AppKit supports swapping assets through `OmnistonSwapProvider`.

### Installation

```bash
pnpm add @ston-fi/omniston-sdk
```

### Setup

Initialize `AppKit` with `OmnistonSwapProvider`:

```ts
// Initialize AppKit with swap provider
const appKit = new AppKit({
    networks: {
        [Network.mainnet().chainId]: {
            apiClient: {
                url: 'https://toncenter.com',
                key: 'your-key',
            },
        },
    },
    providers: [
        new OmnistonSwapProvider({
            // Optional configuration
            apiUrl: 'https://api.ston.fi',
            defaultSlippageBps: 100, // 1%
        }),
    ],
});
```

### Hooks

Use `useSwapQuote` to get a quote and `useBuildSwapTransaction` to build the transaction.

See [Swap Hooks](./docs/hooks.md#swap) for usage examples.

## Migration from TonConnect UI

If you are using `@tonconnect/ui-react` and want to migrate to AppKit gradually, you can use `TonConnectBridge`.

> [!IMPORTANT]
> This bridge is **deprecated** and should only be used for temporary migration. It allows you to use `@tonconnect/ui-react` hooks (like `useTonAddress`, `useTonWallet`, etc.) while using AppKit as the underlying provider.

First, wrap your application in `TonConnectBridge` inside `AppKitProvider`:

```tsx
import { TonConnectBridge } from '@ton/appkit-react/tonconnect';

export const AppTonConnect: FC = () => {
    return (
        <AppKitProvider appKit={appKit}>
            <TonConnectBridge>
                <AppContent />
            </TonConnectBridge>
        </AppKitProvider>
    );
};
```

Then you can use standard TonConnect hooks in your components:

```tsx
import { useTonAddress } from '@tonconnect/ui-react';

export const AppContent: FC = () => {
    const address = useTonAddress();

    return <p>Address: {address}</p>;
};
```

## Documentation

- [Hooks](./docs/hooks.md): React hooks for wallet connection, state, and data fetching.
- [Components](./docs/components.md): UI components for AppKit.

## License

MIT
