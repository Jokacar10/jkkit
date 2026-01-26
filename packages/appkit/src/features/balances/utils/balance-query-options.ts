/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import type { TokenAmount } from '@ton/walletkit';
import { Network } from '@ton/walletkit';

import type { AppKit } from '../../../core/app-kit';
import type { QueryOptions } from '../../../core/query';

export function balanceQueryOptions(
    appKit: AppKit,
    address: string | Address,
    network?: Network,
): QueryOptions<TokenAmount> {
    const addressString = Address.isAddress(address) ? address.toString() : Address.parse(address).toString();
    const networkId = network ? network.chainId : Network.mainnet().chainId;

    return {
        queryKey: ['balance', networkId, addressString],
        staleTime: 5 * 1000,
        queryFn: async () => {
            const client = appKit.networkManager.getClient(network ?? Network.mainnet());
            const balance = await client.getBalance(addressString);

            return balance;
        },
    };
}
