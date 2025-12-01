/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { create } from 'zustand/react';

import type { Transaction } from '../types/transaction';

export interface TransactionsState {
    transactions: Transaction[];
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

const initialState: TransactionsState = {
    transactions: [],
    isLoading: false,
    isInitialized: false,
    error: null,
};

export const useTransactionsStore = create<TransactionsState>(() => initialState);
