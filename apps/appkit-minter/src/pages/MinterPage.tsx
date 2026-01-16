/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type React from 'react';

import { Layout, CardGenerator, WalletConnect, JettonsCard, NftsCard } from '@/components';
import { useAppKit, useWalletAssets } from '@/hooks';

export const MinterPage: React.FC = () => {
    const { isConnected } = useAppKit();
    const { jettons, nfts, isLoadingJettons, isLoadingNfts, jettonsError, nftsError, loadJettons, loadNfts } =
        useWalletAssets();

    return (
        <Layout title="NFT Minter">
            <div className="space-y-4">
                {/* Wallet Connection - shown when not connected */}
                {!isConnected && <WalletConnect />}

                {/* Card Generator with integrated mint button */}
                <CardGenerator />

                {/* Connected wallet assets */}
                {isConnected && (
                    <div className="space-y-4">
                        <JettonsCard
                            jettons={jettons}
                            isLoading={isLoadingJettons}
                            error={jettonsError}
                            onRefresh={loadJettons}
                        />
                        <NftsCard nfts={nfts} isLoading={isLoadingNfts} error={nftsError} onRefresh={loadNfts} />
                    </div>
                )}
            </div>
        </Layout>
    );
};
