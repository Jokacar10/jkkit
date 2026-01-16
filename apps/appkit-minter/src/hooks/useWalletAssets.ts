/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Jetton, NFT } from '@ton/walletkit';

import { useAppKit } from './useAppKit';

interface WalletAssetsState {
    jettons: Jetton[];
    nfts: NFT[];
    isLoadingJettons: boolean;
    isLoadingNfts: boolean;
    jettonsError: string | null;
    nftsError: string | null;
}

export function useWalletAssets() {
    const { isConnected, wallet, getAppKit, getTonConnect } = useAppKit();

    const [state, setState] = useState<WalletAssetsState>({
        jettons: [],
        nfts: [],
        isLoadingJettons: false,
        isLoadingNfts: false,
        jettonsError: null,
        nftsError: null,
    });

    const wrappedWallet = useMemo(() => {
        if (!isConnected || !wallet) return null;
        const appKit = getAppKit();
        const tonConnect = getTonConnect();
        if (!appKit || !tonConnect) return null;
        return appKit.wrapTonConnectWallet(wallet, tonConnect);
    }, [isConnected, wallet, getAppKit, getTonConnect]);

    const loadJettons = useCallback(async () => {
        if (!wrappedWallet) return;

        setState((prev) => ({ ...prev, isLoadingJettons: true, jettonsError: null }));

        try {
            const response = await wrappedWallet.getJettons({
                pagination: { offset: 0, limit: 50 },
            });
            setState((prev) => ({
                ...prev,
                jettons: response.jettons,
                isLoadingJettons: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                isLoadingJettons: false,
                jettonsError: error instanceof Error ? error.message : 'Failed to load jettons',
            }));
        }
    }, [wrappedWallet]);

    const loadNfts = useCallback(async () => {
        if (!wrappedWallet) return;

        setState((prev) => ({ ...prev, isLoadingNfts: true, nftsError: null }));

        try {
            const response = await wrappedWallet.getNfts({
                pagination: { offset: 0, limit: 50 },
            });
            setState((prev) => ({
                ...prev,
                nfts: response.nfts,
                isLoadingNfts: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                isLoadingNfts: false,
                nftsError: error instanceof Error ? error.message : 'Failed to load NFTs',
            }));
        }
    }, [wrappedWallet]);

    const refresh = useCallback(async () => {
        await Promise.all([loadJettons(), loadNfts()]);
    }, [loadJettons, loadNfts]);

    // Auto-load assets when wallet connects
    useEffect(() => {
        if (wrappedWallet) {
            loadJettons();
            loadNfts();
        } else {
            // Clear assets when wallet disconnects
            setState({
                jettons: [],
                nfts: [],
                isLoadingJettons: false,
                isLoadingNfts: false,
                jettonsError: null,
                nftsError: null,
            });
        }
    }, [wrappedWallet, loadJettons, loadNfts]);

    return {
        ...state,
        loadJettons,
        loadNfts,
        refresh,
    };
}
