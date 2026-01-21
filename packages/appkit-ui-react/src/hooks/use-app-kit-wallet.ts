/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import type { WalletInterface } from '@ton/appkit';

import { useAppKit } from './use-app-kit';

/**
 * Use it to get user's current ton wallet. If wallet is not connected hook will return null.
 */
export function useAppKitWallet(): WalletInterface | null {
    const originalWallet = useTonWallet();
    const { appKit, tonConnectUI } = useAppKit();

    return useMemo(() => {
        if (!appKit || !originalWallet) {
            return null;
        }

        return appKit.wrapTonConnectWallet(originalWallet, tonConnectUI.connector);
    }, [originalWallet]);
}
