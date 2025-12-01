/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JettonTransferParams } from '@ton/walletkit';

import { useSendTransactionStore } from '../store';

import { toMinorUnit } from '@/core/utils/amount/minor-unit';
import { getErrorMessage } from '@/core/utils/errors/get-error-message';
import type { JettonBalance } from '@/features/balances';
import { useWalletStore } from '@/features/wallets';

export const sendJetton = async (jetton: JettonBalance): Promise<void> => {
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

        const jettonAmount = toMinorUnit(amount, jetton.decimals);

        const jettonTransferParams: JettonTransferParams = {
            toAddress: recipient,
            jettonAddress: jetton.address,
            amount: jettonAmount.toString(),
        };

        // Create jetton transfer transaction
        const result = await wallet.createTransferJettonTransaction(jettonTransferParams);

        // Send transaction
        await wallet.sendTransaction(result);

        useSendTransactionStore.setState({
            isSending: false,
            recipient: '',
            amount: '',
        });
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'Failed to send jetton');

        useSendTransactionStore.setState({
            isSending: false,
            error: errorMessage,
        });

        throw error;
    }
};
