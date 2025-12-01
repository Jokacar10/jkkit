/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TonTransferParams } from '@ton/walletkit';

import { useSendTransactionStore } from '../store';

import { toMinorUnit } from '@/core/utils/amount/minor-unit';
import { getErrorMessage } from '@/core/utils/errors/get-error-message';
import { useWalletStore } from '@/features/wallets';

export const sendTon = async (): Promise<void> => {
    try {
        const { recipient, amount } = useSendTransactionStore.getState();
        const { walletKit, address } = useWalletStore.getState();

        if (!(walletKit && address)) {
            throw new Error('Wallet not initialized');
        }

        useSendTransactionStore.setState({ isSending: true, error: null });

        // Get wallet from WalletKit
        const wallets = walletKit.getWallets();
        const wallet = wallets.find((w) => w.getAddress() === address);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        // Convert amount to nanotons
        const nanoTonAmount = toMinorUnit(amount, 9);

        const tonTransferParams: TonTransferParams = {
            toAddress: recipient,
            amount: nanoTonAmount.toString(),
        };

        // Create transaction
        const result = await wallet.createTransferTonTransaction(tonTransferParams);

        // Send transaction
        await wallet.sendTransaction(result);

        useSendTransactionStore.setState({
            isSending: false,
            recipient: '',
            amount: '',
        });
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'Failed to send TON');

        useSendTransactionStore.setState({
            isSending: false,
            error: errorMessage,
        });

        throw error;
    }
};
