/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';

import { DataBlock } from '@/core/components/data-block';
import { useWalletStore } from '@/features/wallets';

export const WalletInfoSection: FC = () => {
    const address = useWalletStore((state) => state.address);
    const publicKey = useWalletStore((state) => state.publicKey);

    return (
        <DataBlock.Container>
            <DataBlock.Row>
                <DataBlock.Key>
                    <DataBlock.Text>Address</DataBlock.Text>
                </DataBlock.Key>
                <DataBlock.Value>
                    <DataBlock.Text>{address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'N/A'}</DataBlock.Text>
                </DataBlock.Value>
            </DataBlock.Row>

            <DataBlock.Row>
                <DataBlock.Key>
                    <DataBlock.Text>Public Key</DataBlock.Text>
                </DataBlock.Key>
                <DataBlock.Value>
                    <DataBlock.Text>
                        {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-6)}` : 'N/A'}
                    </DataBlock.Text>
                </DataBlock.Value>
            </DataBlock.Row>

            <DataBlock.Row isLastRow>
                <DataBlock.Key>
                    <DataBlock.Text>Network</DataBlock.Text>
                </DataBlock.Key>
                <DataBlock.Value>
                    <DataBlock.Text>Mainnet</DataBlock.Text>
                </DataBlock.Value>
            </DataBlock.Row>
        </DataBlock.Container>
    );
};
