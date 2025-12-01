/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ITonWalletKit } from '@ton/walletkit';
import { CHAIN, TonWalletKit } from '@ton/walletkit';

import { kitStorage } from '../storages/kit-storage';

export const createWalletKitInstance = (): ITonWalletKit => {
    const apiKey = '25a9b2326a34b39a5fa4b264fb78fb4709e1bd576fc5e6b176639f5b71e94b0d';

    return new TonWalletKit({
        network: CHAIN.MAINNET,
        apiClient: { key: apiKey },
        storage: kitStorage,
    }) as ITonWalletKit;
};
