/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

const TEMP_MNEMONIC_KEY = 'temp_mnemonic';

export const tempStorage = {
    /**
     * Save mnemonic to secure storage
     */
    async saveTempMnemonic(mnemonic: string): Promise<void> {
        await setItemAsync(TEMP_MNEMONIC_KEY, mnemonic);
    },

    /**
     * Get mnemonic from secure storage
     */
    async getTempMnemonic(): Promise<string | null> {
        return await getItemAsync(TEMP_MNEMONIC_KEY);
    },

    /**
     * Delete mnemonic from secure storage
     */
    async deleteTempMnemonic(): Promise<void> {
        await deleteItemAsync(TEMP_MNEMONIC_KEY);
    },

    /**
     * Check if mnemonic exists in secure storage
     */
    async hasTempMnemonic(): Promise<boolean> {
        const mnemonic = await getItemAsync(TEMP_MNEMONIC_KEY);
        return mnemonic !== null;
    },
};
