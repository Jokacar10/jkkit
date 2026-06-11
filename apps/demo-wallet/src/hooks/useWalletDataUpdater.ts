/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect } from 'react';
import { useAuth, useJettons, useNfts, useWallet } from '@demo/wallet-core';

export const useWalletDataUpdater = () => {
    const { address, updateBalance, hasWallet, currentWallet, loadAllWallets } = useWallet();
    const { isUnlocked } = useAuth();
    const { loadUserJettons, clearJettons } = useJettons();
    const { loadUserNfts, clearNfts, refreshNfts } = useNfts();

    // Load wallets when hasWallet but currentWallet missing (e.g. refresh on /send before rehydration)
    useEffect(() => {
        if (hasWallet && isUnlocked && !currentWallet) {
            void loadAllWallets();
        }
    }, [hasWallet, isUnlocked, currentWallet, loadAllWallets]);

    // Update on address change
    useEffect(() => {
        if (!address) return;

        clearNfts();
        clearJettons();
        void Promise.allSettled([updateBalance(), loadUserJettons(), loadUserNfts()]);
    }, [address, updateBalance, loadUserJettons, loadUserNfts, clearNfts, clearJettons]);

    // Periodic refresh: balances, jettons and NFTs sequentially to avoid overloading the backend
    useEffect(() => {
        if (!address) return;

        let cancelled = false;
        let timeout: ReturnType<typeof setTimeout>;
        const refreshInterval = 20_000;

        const tick = async () => {
            await updateBalance().catch(() => {});
            if (cancelled) return;
            await loadUserJettons().catch(() => {});
            if (cancelled) return;
            await refreshNfts().catch(() => {});
            if (cancelled) return;
            timeout = setTimeout(() => void tick(), refreshInterval);
        };

        timeout = setTimeout(() => void tick(), refreshInterval);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [address, updateBalance, loadUserJettons, refreshNfts]);
};
