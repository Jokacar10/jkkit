/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useWalletStore } from '../store';

import { restoreWallet } from '@/features/wallets';

export const initWalletState = async (): Promise<boolean> => {
    const isAuthenticated = await restoreWallet();

    useWalletStore.setState({ isAuthenticated, isInitialized: true });

    return isAuthenticated;
};
