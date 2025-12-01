/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { create } from 'zustand/react';

export interface JettonBalance {
    address: string;
    balance: string;
    symbol: string;
    decimals: number;
    name: string;
    image?: string;
}

export interface WalletState {
    isInitialized: boolean;

    tonBalance: string;
    jettonBalances: JettonBalance[];

    isLoading: boolean;
    error: string | null;
}

const initialState: WalletState = {
    isInitialized: false,
    tonBalance: '',
    jettonBalances: [],
    isLoading: false,
    error: null,
};

export const useBalancesStore = create<WalletState>(() => initialState);
