---
target: packages/walletkit/src/defi/swap/omniston/README.md
---

# Omniston Swap Provider

Omniston is STON.fi's swap aggregator that finds the best rates across multiple DEXs on TON blockchain.

For detailed information about Omniston features and capabilities, see the [official documentation](https://docs.ston.fi/developer-section/omniston).

## Quick Start

%%demo/examples/src/appkit/swap#OMNISTON_QUICK_START%%

## Configuration Options

```typescript
interface OmnistonSwapProviderConfig {
    apiUrl?: string;              // Default: 'wss://omni-ws.ston.fi'
    defaultSlippageBps?: number;  // Default: 100 (1%)
    quoteTimeoutMs?: number;      // Default: 10000ms
    referrerAddress?: string;     // Optional referrer address
    referrerFeeBps?: number;      // Referrer fee in bps
    flexibleReferrerFee?: boolean; // Default: false
}

interface SwapQuoteParams {
    from: SwapToken;
    to: SwapToken;
    amount: string;
    network: Network;
    slippageBps?: number;
    maxOutgoingMessages?: number; // Max messages per tx (default: 1 if not specified)
    providerOptions?: OmnistonProviderOptions;
}
```

**Important:** The `maxOutgoingMessages` parameter should be extracted from the wallet's features using `getMaxOutgoingMessages()` utility. If not provided, it defaults to `1`, which may limit swap route optimization.

### Usage Example

%%demo/examples/src/appkit/swap#OMNISTON_USAGE_EXAMPLE%%

## Referral Fees

Pass referral options via `providerOptions` to earn fees on swaps:

%%demo/examples/src/appkit/swap#OMNISTON_REFERRAL_FEES%%

### Overriding Referral Settings

You can set a global referrer in provider config and override it for specific requests:

%%demo/examples/src/appkit/swap#OMNISTON_OVERRIDING_REFERRAL%%

## Resources

- [Omniston Documentation](https://docs.ston.fi/developer-section/omniston) - Complete guide and API reference
- [Referral Fees](https://docs.ston.fi/developer-section/omniston/referral-fees) - How to earn fees
- [SDK Repository](https://github.com/ston-fi/omniston-sdk) - Source code and examples
- [Demo Implementation](https://github.com/ton-connect/kit/blob/main/apps/demo-wallet/src/pages/Swap.tsx) - Working example
