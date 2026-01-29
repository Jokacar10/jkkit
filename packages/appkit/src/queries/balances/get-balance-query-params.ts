/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Network } from '@ton/walletkit';
import type { TokenAmount } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';
import { getBalance } from '../../actions/balances/get-balance';
import type { GetBalanceOptions as GetBalanceActionOptions } from '../../actions/balances/get-balance';
import type { QueryOptions } from '../../types/query';

export interface GetBalanceOptions extends Partial<GetBalanceActionOptions> {
    query?: {
        enabled?: boolean;
    };
}

export function getBalanceQueryOptions(
    appKit: AppKit,
    options: GetBalanceOptions = {},
): QueryOptions<TokenAmount | null> {
    return {
        ...options.query,
        enabled: Boolean(options.address && (options.query?.enabled ?? true)),
        queryFn: async () => {
            const { address } = options;

            if (!address) throw new Error('address is required');

            const network = options.network ?? Network.mainnet();

            const balance = await getBalance(appKit, {
                address,
                network,
            });
            return balance ?? null;
        },
        queryKey: getBalanceQueryKey(options),
    };
}

export function getBalanceQueryKey(options: GetBalanceOptions = {}) {
    const { address } = options;
    const network = options.network ?? Network.mainnet();
    return ['balance', address, network.chainId] as const;
}
