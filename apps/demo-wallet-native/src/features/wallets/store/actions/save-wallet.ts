/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { CHAIN, Signer, WalletV5R1Adapter } from '@ton/walletkit';

import { mnemonicStorage } from '../../storages/mnemonic-storage';
import { tempStorage } from '../../storages/temp-storage';
import { createWalletKitInstance } from '../../utils/wallet-kit-instance';
import { useWalletStore } from '../store';

import { getErrorMessage } from '@/core/utils/errors/get-error-message';

export const saveWallet = async (): Promise<void> => {
    try {
        useWalletStore.setState({ isLoading: true, error: null });

        const mnemonic = await tempStorage.getTempMnemonic();

        if (!mnemonic) {
            throw new Error('Failed to create wallet: no temp mnemonic found');
        }

        // Create WalletKit instance
        const walletKit = createWalletKitInstance();

        // Wait for WalletKit to be ready
        while (!walletKit.isReady()) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Create signer from mnemonic
        const signer = await Signer.fromMnemonic(mnemonic, { type: 'ton' });

        // Create wallet adapter
        const walletAdapter = await WalletV5R1Adapter.create(signer, {
            client: walletKit.getApiClient(),
            network: CHAIN.MAINNET,
        });

        // Add wallet to WalletKit
        const wallet = await walletKit.addWallet(walletAdapter);

        if (!wallet) {
            throw new Error('Failed to add wallet to WalletKit');
        }

        const address = wallet.getAddress();
        const publicKey = wallet.getPublicKey();

        // Save mnemonic to secure storage
        await mnemonicStorage.saveMnemonic(mnemonic);

        // Update store
        useWalletStore.setState({
            address,
            publicKey,
            walletKit,
            walletAdapter,
            isLoading: false,
            isAuthenticated: true,
        });

        void tempStorage.deleteTempMnemonic();
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'Failed to create wallet');

        useWalletStore.setState({
            isLoading: false,
            error: errorMessage,
        });

        throw error;
    }
};
