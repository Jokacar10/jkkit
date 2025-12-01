/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

const MNEMONIC_KEY = 'wallet_mnemonic';

export const mnemonicStorage = {
    /**
     * Save mnemonic to secure storage
     */
    async saveMnemonic(mnemonic: string): Promise<void> {
        await setItemAsync(MNEMONIC_KEY, mnemonic);
    },

    /**
     * Get mnemonic from secure storage
     */
    async getMnemonic(): Promise<string | null> {
        return await getItemAsync(MNEMONIC_KEY);
    },

    /**
     * Delete mnemonic from secure storage
     */
    async deleteMnemonic(): Promise<void> {
        await deleteItemAsync(MNEMONIC_KEY);
    },

    /**
     * Check if mnemonic exists in secure storage
     */
    async hasMnemonic(): Promise<boolean> {
        const mnemonic = await getItemAsync(MNEMONIC_KEY);
        return mnemonic !== null;
    },
};
