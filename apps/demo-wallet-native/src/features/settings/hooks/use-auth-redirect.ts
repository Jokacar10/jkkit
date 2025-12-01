/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { router, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useWalletStore } from '@/features/wallets';

export const useAuthRedirect = (isRouterLoading: boolean): void => {
    const isInitialized = useWalletStore((state) => state.isInitialized);
    const isAuthenticated = useWalletStore((state) => state.isAuthenticated);

    const segments = useSegments();

    useEffect(() => {
        if (isInitialized && !isRouterLoading) {
            const inAuthGroup = segments[0] === '(non-auth)';

            if (!(isAuthenticated || inAuthGroup)) {
                // Redirect to the sign-in page.
                router.replace('/(non-auth)/start');
            } else if (isAuthenticated && inAuthGroup) {
                // Redirect away from the sign-in page.
                router.replace('/(auth)/(tabs)/wallet');
            }
        }
    }, [isAuthenticated, segments, isInitialized, isRouterLoading]);
};
