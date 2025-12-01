/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { create } from 'zustand/react';

import type { JettonBalance } from '@/features/balances';

export interface SendTransactionState {
    // Selected token
    selectedToken: 'TON' | JettonBalance | null;

    // Form fields
    recipient: string;
    amount: string;

    // Loading states
    isLoading: boolean;
    isSending: boolean;

    // Error state
    error: string | null;
}

const initialState: SendTransactionState = {
    selectedToken: 'TON',
    recipient: '',
    amount: '',
    isLoading: false,
    isSending: false,
    error: null,
};

export const useSendTransactionStore = create<SendTransactionState>(() => initialState);
