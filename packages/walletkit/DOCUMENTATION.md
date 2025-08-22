## TonWalletKit – Integration Guide

This guide shows how to integrate `@ton/walletkit` into your app with minimal boilerplate. It abstracts TON Connect and wallet specifics behind a clean API and UI-friendly events.

After you complete this guide, you'll have your wallet fully integrated with the TON ecosystem. You'll be able to interact with dApps, NFTs, and jettons.

### Install

Use pnpm:

```bash
pnpm add @ton/walletkit
```

### 1) Initialize the kit

```ts
import { TonWalletKit, WalletInitConfigMnemonic } from '@ton/walletkit';

const kit = new TonWalletKit({
  bridgeUrl: 'https://bridge.tonapi.io/bridge',
  network: 'mainnet',
});

// Optionally preload a wallet (mnemonic or private key)
const walletConfig = new WalletInitConfigMnemonic({
  mnemonic: ['word1', 'word2', '...'],
  version: 'v5r1',
  mnemonicType: 'ton',
  network: 'mainnet',
});
await kit.addWallet(walletConfig);
```

### 2) Listen for requests from dApps

Register simple callbacks that show UI and then approve or reject via kit methods.

```ts
// Connect requests
kit.onConnectRequest(async (req) => {
  // Use wallet selected by your app (e.g., from user settings)
  const userWalletAddress = getSelectedWalletAddress(); // provided by integrator
  const wallet = kit.getWallet(userWalletAddress);
  if (!wallet) return;

  // Minimal confirmation flow
  if (confirm(`Connect ${req.dAppName}?`)) {
    await kit.approveConnectRequest({ ...req, wallet });
  } else {
    await kit.rejectConnectRequest(req, 'User rejected');
  }
});

// Transaction requests
kit.onTransactionRequest(async (tx) => {
  if (confirm('Do you confirm this transaction?')) {
    await kit.approveTransactionRequest(tx);
  } else {
    await kit.rejectTransactionRequest(tx, 'User rejected');
  }
});

// Sign data requests
kit.onSignDataRequest(async (sd) => {
  if (confirm('Sign this data?')) {
    await kit.signDataRequest(sd);
  } else {
    await kit.rejectSignDataRequest(sd, 'User rejected');
  }
});

// Disconnect events
kit.onDisconnect((evt) => {
  // Perform cleanup in your app (close modals, clear session UI, etc.)
  cleanupAfterDisconnect(evt.wallet.getAddress());
});
```

### 3) Handle TON Connect links

Pass a TON Connect URL to the kit to trigger a connect request event.

```ts
// Example: from a QR scanner or deep link
async function onTonConnectLink(url: string) {
  await kit.handleTonConnectUrl(url);
}
```

### 4) Basic wallet operations

```ts
const address = getSelectedWalletAddress();
const current = kit.getWallet(address);
if (!current) return;
const balance = await current.getBalance();
console.log(address, balance.toString());
```

### Example: minimal UI state wiring

```ts
type AppState = {
  connectModal?: { request: any };
  txModal?: { request: any };
};

const state: AppState = {};

kit.onConnectRequest((req) => {
  state.connectModal = { request: req };
});

kit.onTransactionRequest((tx) => {
  state.txModal = { request: tx };
});

async function approveConnect() {
  if (!state.connectModal) return;
  const address = getSelectedWalletAddress();
  const wallet = kit.getWallet(address);
  if (!wallet) return;
  await kit.approveConnectRequest({ ...state.connectModal.request, wallet });
  state.connectModal = undefined;
}

async function rejectConnect() {
  if (!state.connectModal) return;
  await kit.rejectConnectRequest(state.connectModal.request, 'User rejected');
  state.connectModal = undefined;
}

async function approveTx() {
  if (!state.txModal) return;
  await kit.approveTransactionRequest(state.txModal.request);
  state.txModal = undefined;
}

async function rejectTx() {
  if (!state.txModal) return;
  await kit.rejectTransactionRequest(state.txModal.request, 'User rejected');
  state.txModal = undefined;
}
```

### Error handling tips

- Wrap approvals in try/catch to surface actionable messages.
- Validate there is at least one wallet before approving a connect.
- Surface preview data to users: `req.preview`, `tx.preview.moneyFlow`, `sd.preview`.

### Demo wallet reference

See `apps/demo-wallet` for a working example. The store slice `src/stores/slices/walletSlice.ts` shows how to:

- Initialize the kit and add a wallet from mnemonic.
- Wire `onConnectRequest` and `onTransactionRequest` to open modals.
- Approve or reject requests using the kit methods.


