/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';

import { useSelectedWallet } from '../../wallets/hooks/use-selected-wallet';

export type UseSelectedWalletNetworkReturnType = ReturnType<typeof useSelectedWallet>[0] extends infer W
    ? W extends { getNetwork: () => infer N }
        ? N
        : null
    : null;

/**
 * Hook to get the network of the currently selected wallet
 */
export const useSelectedWalletNetwork = (): UseSelectedWalletNetworkReturnType => {
    const [wallet] = useSelectedWallet();

    return useMemo(() => {
        return wallet?.getNetwork() ?? null;
    }, [wallet]);
};
