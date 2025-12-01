/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { CHAIN, Signer, WalletV5R1Adapter } from '@ton/walletkit';

import { createWalletKitInstance } from '../../utils/wallet-kit-instance';
import { useWalletStore } from '../store';

import { mnemonicStorage } from '@/features/wallets/storages/mnemonic-storage';

/**
 * Restore wallet from secure storage on app start
 */
export const restoreWallet = async (): Promise<boolean> => {
    try {
        const mnemonic = await mnemonicStorage.getMnemonic();

        if (!mnemonic) {
            return false;
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

        // Update store
        useWalletStore.setState({
            address,
            publicKey,
            walletKit,
            walletAdapter,
        });

        return true;
    } catch (_error) {
        return false;
    }
};
