/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useContext } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';

import { AppKitContext } from '../components/app-kit-provider';

export function useAppKit() {
    const [tonConnectUI] = useTonConnectUI();
    const appKit = useContext(AppKitContext);

    const disconnect = useCallback(async () => {
        await tonConnectUI.disconnect();
    }, [tonConnectUI]);

    return {
        appKit,
        tonConnectUI,

        // actions
        disconnect,
    };
}
