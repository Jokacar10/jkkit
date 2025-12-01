/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { mnemonicValidate } from '@ton/crypto';

import { tempStorage } from '../../storages/temp-storage';
import { useWalletStore } from '../store';

import { getErrorMessage } from '@/core/utils/errors/get-error-message';

const regexp = /\s+/;

/**
 * Import wallet from mnemonic
 * @param mnemonic - The mnemonic phrase (12 or 24 words)
 */
export const importWallet = async (mnemonic: string): Promise<void> => {
    try {
        useWalletStore.setState({ isLoading: true, error: null });

        // Validate and normalize mnemonic
        const mnemonicTrimmed = mnemonic.trim().toLowerCase();
        const words = mnemonicTrimmed.split(regexp).filter(Boolean);

        // Check word count
        if (words.length !== 12 && words.length !== 24) {
            throw new Error(`Invalid mnemonic: expected 12 or 24 words, got ${words.length}`);
        }

        // Validate mnemonic using @ton/crypto
        const isValid = await mnemonicValidate(words);
        if (!isValid) {
            throw new Error('Invalid mnemonic: the recovery phrase is not valid. Please check your words.');
        }

        await tempStorage.saveTempMnemonic(words.join(' '));

        useWalletStore.setState({ isLoading: false });
    } catch (error) {
        const errorMessage = getErrorMessage(error, 'Failed to import wallet');
        useWalletStore.setState({
            isLoading: false,
            error: errorMessage,
        });
        throw error;
    }
};
