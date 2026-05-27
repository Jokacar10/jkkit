/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getGaslessJettonTransferQuote } from '../../actions/gasless/get-gasless-jetton-transfer-quote';
import type {
    GetGaslessJettonTransferQuoteErrorType,
    GetGaslessJettonTransferQuoteOptions,
    GetGaslessJettonTransferQuoteReturnType,
} from '../../actions/gasless/get-gasless-jetton-transfer-quote';
import { getSelectedWallet } from '../../actions/wallets/get-selected-wallet';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';
import { GASLESS_QUOTE_STALE_TIME_MS } from './get-gasless-quote';

export type { GetGaslessJettonTransferQuoteErrorType };

export type GetGaslessJettonTransferQuoteQueryConfig<selectData = GetGaslessJettonTransferQuoteData> = Compute<
    ExactPartial<GetGaslessJettonTransferQuoteOptions>
> &
    QueryParameter<
        GetGaslessJettonTransferQuoteQueryFnData,
        GetGaslessJettonTransferQuoteErrorType,
        selectData,
        GetGaslessJettonTransferQuoteQueryKey
    >;

export const getGaslessJettonTransferQuoteQueryOptions = <selectData = GetGaslessJettonTransferQuoteData>(
    appKit: AppKit,
    options: GetGaslessJettonTransferQuoteQueryConfig<selectData> = {},
): GetGaslessJettonTransferQuoteQueryOptions<selectData> => {
    // Bind the quote to the selected wallet's address and network so a
    // wallet/network switch produces a distinct cache entry and refetch
    // (mirrors `getGaslessQuoteQueryOptions`). The quote is always built for the
    // selected wallet's network, so the key tracks that — not a caller override.
    const wallet = getSelectedWallet(appKit);
    const walletAddress = wallet?.getAddress();
    const resolvedOptions = { ...options, network: wallet?.getNetwork() };

    return {
        staleTime: GASLESS_QUOTE_STALE_TIME_MS,
        ...options.query,
        // Gate on a connected wallet too: the action resolves the jetton wallet
        // via the selected wallet and throws without one, so without this the
        // query would fire into a `Wallet not connected` error instead of idling.
        enabled: Boolean(
            options.jettonAddress &&
            options.recipientAddress &&
            options.amount &&
            walletAddress &&
            (options.query?.enabled ?? true),
        ),
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [
                string,
                GetGaslessJettonTransferQuoteOptions,
                string | undefined,
            ];
            return getGaslessJettonTransferQuote(appKit, parameters);
        },
        queryKey: getGaslessJettonTransferQuoteQueryKey(resolvedOptions, walletAddress),
    };
};

export type GetGaslessJettonTransferQuoteQueryFnData = Compute<Awaited<GetGaslessJettonTransferQuoteReturnType>>;

export type GetGaslessJettonTransferQuoteData = GetGaslessJettonTransferQuoteQueryFnData;

export const getGaslessJettonTransferQuoteQueryKey = (
    options: Compute<ExactPartial<GetGaslessJettonTransferQuoteOptions>> = {},
    walletAddress?: string,
): GetGaslessJettonTransferQuoteQueryKey => {
    return [
        'gaslessJettonTransferQuote',
        filterQueryOptions(options as unknown as Record<string, unknown>),
        walletAddress,
    ] as const;
};

export type GetGaslessJettonTransferQuoteQueryKey = readonly [
    'gaslessJettonTransferQuote',
    Compute<ExactPartial<GetGaslessJettonTransferQuoteOptions>>,
    string | undefined,
];

export type GetGaslessJettonTransferQuoteQueryOptions<selectData = GetGaslessJettonTransferQuoteData> = QueryOptions<
    GetGaslessJettonTransferQuoteQueryFnData,
    GetGaslessJettonTransferQuoteErrorType,
    selectData,
    GetGaslessJettonTransferQuoteQueryKey
>;
