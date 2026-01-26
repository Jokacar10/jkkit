/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TokenAmount, Network } from '@ton/walletkit';

import type { AppKit } from '../../../core/app-kit';
import { balanceQueryOptions } from '../utils/balance-query-options';
import type { QueryState } from '../../../core/query';

export type QueryBalanceParameters = {
    address: string;
    network?: Network;
    onChange: (balance: TokenAmount) => void;
};

export type QueryBalanceReturnType = () => void;

/**
 * Watch connected wallets
 */
export function queryBalance(appKit: AppKit, parameters: QueryBalanceParameters): QueryBalanceReturnType {
    const { address, network, onChange } = parameters;
    const queryOptions = balanceQueryOptions(appKit, address, network);

    // Build the query instance
    const query = appKit.queryClient.getQueryCache().build<TokenAmount, unknown>(appKit.queryClient, queryOptions);

    const observer = {
        onStateUpdate: (state: QueryState<TokenAmount, unknown>) => {
            if (state.data !== undefined) {
                onChange(state.data);
            }
        },
    };

    query.addObserver(observer);

    // Trigger initial fetch if needed
    if (query.isStale()) {
        query.fetch(queryOptions).catch(() => {
            // Error handling could be added here or exposed via onChange/onError
        });
    } else {
        if (query.state.data !== undefined) {
            onChange(query.state.data);
        }
    }

    return () => {
        query.removeObserver(observer);
    };
}
