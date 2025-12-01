/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ITonWalletKit, IWalletAdapter } from '@ton/walletkit';
import { create } from 'zustand/react';

export interface WalletState {
    isInitialized: boolean;
    isAuthenticated: boolean;

    // Wallet info
    address: string | null;
    publicKey: string | null;

    // WalletKit instances
    walletKit: ITonWalletKit | null;
    walletAdapter: IWalletAdapter | null;

    // Loading states
    isLoading: boolean;

    // Error state
    error: string | null;
}

const initialState: WalletState = {
    isInitialized: false,
    isAuthenticated: false,
    address: null,
    publicKey: null,
    walletKit: null,
    walletAdapter: null,
    isLoading: false,
    error: null,
};

export const useWalletStore = create<WalletState>(() => initialState);
