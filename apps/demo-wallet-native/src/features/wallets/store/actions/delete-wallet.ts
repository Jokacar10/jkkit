/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { mnemonicStorage } from '../../storages/mnemonic-storage';
import { useWalletStore } from '../store';

import { resetBalancesState } from '@/features/balances';
import { resetTransactionsState } from '@/features/transactions';

/**
 * Delete wallet and clear all data
 */
export const deleteWallet = async (): Promise<void> => {
    // Delete mnemonic from secure storage
    await mnemonicStorage.deleteMnemonic();

    // Reset store to initial state
    useWalletStore.setState({
        ...useWalletStore.getInitialState(),
        isInitialized: true,
    });

    resetBalancesState();
    resetTransactionsState();
};
