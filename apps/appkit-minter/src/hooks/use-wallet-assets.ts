/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useCallback } from 'react';
import type { NFT } from '@ton/walletkit';
import { isValidAddress } from '@ton/walletkit';
import { useSelectedWallet } from '@ton/appkit-ui-react';

interface TransferState {
    isTransferring: boolean;
    transferError: string | null;
}

export function useWalletAssets() {
    const [wallet] = useSelectedWallet();

    const [transferState, setTransferState] = useState<TransferState>({
        isTransferring: false,
        transferError: null,
    });

    const transferNft = useCallback(
        async (nft: NFT, recipientAddress: string, comment?: string) => {
            if (!wallet) {
                throw new Error('Wallet not connected');
            }

            if (!isValidAddress(recipientAddress)) {
                throw new Error('Invalid recipient address');
            }

            setTransferState({ isTransferring: true, transferError: null });

            try {
                const transaction = await wallet.createTransferNftTransaction({
                    nftAddress: nft.address,
                    recipientAddress,
                    comment,
                });

                await wallet.sendTransaction(transaction);
                setTransferState({ isTransferring: false, transferError: null });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to transfer NFT';
                setTransferState({ isTransferring: false, transferError: errorMessage });
                throw error;
            }
        },
        [wallet],
    );

    return {
        ...transferState,
        transferNft,
    };
}
