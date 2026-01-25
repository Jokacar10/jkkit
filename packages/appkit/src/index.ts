/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * AppKit - Core wallet management for TON dApps
 *
 * This is the main entry point for AppKit. It provides provider-agnostic
 * wallet management functionality.
 *
 * For TonConnect support, import from '@ton/appkit/tonconnect' separately.
 * This allows tree-shaking for users who don't need TonConnect.
 *
 * @example
 * ```ts
 * // Core AppKit (provider-agnostic)
 * import { AppKit } from '@ton/appkit';
 *
 * // TonConnect feature (optional, for tree-shaking)
 * import { TonConnectConnector } from '@ton/appkit/tonconnect';
 * ```
 */

// Features
export * from './core';
export * from './features/events';
export * from './features/wallets';

export * from './types/connector';

// Re-export from @ton/walletkit for convenience
export type { TonWalletKit, TONTransferRequest, JettonsTransferRequest, TransactionRequest } from '@ton/walletkit';
