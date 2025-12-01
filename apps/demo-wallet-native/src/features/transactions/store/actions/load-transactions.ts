/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useTransactionsStore } from '../store';

import { getErrorMessage } from '@/core/utils/errors/get-error-message';
import { mapTx } from '@/features/transactions/store/utils/map-tx';
import { useWalletStore } from '@/features/wallets';

export const loadTransactions = async (): Promise<void> => {
    try {
        const { walletKit, address } = useWalletStore.getState();

        if (!(walletKit && address)) return;

        useTransactionsStore.setState({ isLoading: true, error: null });

        const apiClient = walletKit.getApiClient();
        const response = await apiClient.getAccountTransactions({
            address: [address],
            limit: 100,
            offset: 0,
        });

        const transactions = response.transactions.filter((tx) => !tx.description?.compute_ph?.skipped).map(mapTx);

        useTransactionsStore.setState({
            transactions,
            isLoading: false,
            isInitialized: true,
        });
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'Failed to load transactions');

        useTransactionsStore.setState({
            isLoading: false,
            error: errorMessage,
            isInitialized: true,
        });

        throw error;
    }
};
