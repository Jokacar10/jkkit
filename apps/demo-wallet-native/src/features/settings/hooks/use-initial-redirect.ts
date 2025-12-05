/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useWalletStore, useWallet } from '@ton/demo-core';

export const useInitialRedirect = (isRouterLoading: boolean): void => {
    const [isRedirected, setIsRedirected] = useState(false);

    const isStoreHydrated = useWalletStore((state) => state.isHydrated);
    const isPasswordSet = useWalletStore((state) => state.auth.isPasswordSet);
    const isUnlocked = useWalletStore((state) => state.auth.isUnlocked);
    const { hasWallet } = useWallet();

    const isReady = !isRouterLoading && isStoreHydrated;

    useEffect(() => {
        if (!isReady || isRedirected) return;

        setIsRedirected(true);

        if (!isPasswordSet) {
            router.replace('/(non-auth)/add-new-wallet');

            return;
        }

        if (!isUnlocked) {
            router.replace('/(non-auth)/unlock-wallet');

            return;
        }

        if (!hasWallet) {
            router.replace('/(non-auth)/add-new-wallet');

            return;
        }

        router.replace('/(auth)/(tabs)/wallet');
    }, [isReady, isRedirected, isPasswordSet, isUnlocked, hasWallet]);
};
