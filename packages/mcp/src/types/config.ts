/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Configuration types for createTonWalletMCP factory
 */

import type { IStorageAdapter } from './storage.js';
import type { ISignerAdapter } from './signer.js';
import type { IContactResolver } from './contacts.js';

/**
 * Configuration for createTonWalletMCP factory
 */
export interface TonMcpConfig {
    /**
     * Storage adapter for wallet metadata and pending transactions.
     * Required.
     */
    storage: IStorageAdapter;

    /**
     * Signer adapter for secure key management and signing.
     * Required.
     */
    signer: ISignerAdapter;

    /**
     * Optional contact resolver for name-to-address resolution.
     */
    contacts?: IContactResolver;

    /**
     * Default network for new wallets.
     * @default 'mainnet'
     */
    network?: 'mainnet' | 'testnet';

    /**
     * If true, transactions require explicit confirmation via confirm_transaction tool.
     * @default false
     */
    requireConfirmation?: boolean;

    /**
     * Network-specific configuration (API keys).
     */
    networks?: {
        mainnet?: { apiKey?: string };
        testnet?: { apiKey?: string };
    };
}
