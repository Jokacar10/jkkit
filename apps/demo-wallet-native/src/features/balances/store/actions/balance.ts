/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useBalancesStore } from '../store';

import { fromMinorUnit } from '@/core/utils/amount/minor-unit';
import { getErrorMessage } from '@/core/utils/errors/get-error-message';
import { useWalletStore } from '@/features/wallets';

export const getBalance = async (): Promise<void> => {
    try {
        const { walletKit, address } = useWalletStore.getState();

        if (!(walletKit && address)) return;

        useBalancesStore.setState({ isLoading: true, error: null });

        // Get wallet from WalletKit
        const wallets = walletKit.getWallets();
        const wallet = wallets.find((w) => w.getAddress() === address);

        if (!wallet) {
            throw new Error('Wallet not found in WalletKit');
        }

        // Get TON balance
        const tonBalance = await wallet.getBalance();

        // Get jetton balances
        const jettonBalances = await wallet.getJettons({ limit: 10, offset: 0 });

        useBalancesStore.setState({
            tonBalance: fromMinorUnit(tonBalance, 9).toString(),
            jettonBalances: jettonBalances.jettons.map((jetton) => ({
                address: jetton.address,
                balance: fromMinorUnit(jetton.balance, jetton.decimals).toString(),
                symbol: jetton.symbol,
                decimals: jetton.decimals,
                name: jetton.name,
                image: jetton.image,
            })),
            isLoading: false,
            isInitialized: true,
        });
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'Failed to get balance');

        useBalancesStore.setState({
            isLoading: false,
            error: errorMessage,
            isInitialized: true,
        });

        throw error;
    }
};
