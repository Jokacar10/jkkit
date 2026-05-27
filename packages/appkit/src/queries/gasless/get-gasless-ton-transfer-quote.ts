/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getGaslessTonTransferQuote } from '../../actions/gasless/get-gasless-ton-transfer-quote';
import type {
    GetGaslessTonTransferQuoteErrorType,
    GetGaslessTonTransferQuoteOptions,
    GetGaslessTonTransferQuoteReturnType,
} from '../../actions/gasless/get-gasless-ton-transfer-quote';
import { getSelectedWallet } from '../../actions/wallets/get-selected-wallet';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';
import { GASLESS_QUOTE_STALE_TIME_MS } from './get-gasless-quote';

export type { GetGaslessTonTransferQuoteErrorType };

export type GetGaslessTonTransferQuoteQueryConfig<selectData = GetGaslessTonTransferQuoteData> = Compute<
    ExactPartial<GetGaslessTonTransferQuoteOptions>
> &
    QueryParameter<
        GetGaslessTonTransferQuoteQueryFnData,
        GetGaslessTonTransferQuoteErrorType,
        selectData,
        GetGaslessTonTransferQuoteQueryKey
    >;

export const getGaslessTonTransferQuoteQueryOptions = <selectData = GetGaslessTonTransferQuoteData>(
    appKit: AppKit,
    options: GetGaslessTonTransferQuoteQueryConfig<selectData> = {},
): GetGaslessTonTransferQuoteQueryOptions<selectData> => {
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
        // Gate on a connected wallet too: the action builds the transfer via the
        // selected wallet and throws without one, so without this the query would
        // fire into a `Wallet not connected` error instead of idling.
        enabled: Boolean(
            options.recipientAddress && options.amount && walletAddress && (options.query?.enabled ?? true),
        ),
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetGaslessTonTransferQuoteOptions, string | undefined];
            return getGaslessTonTransferQuote(appKit, parameters);
        },
        queryKey: getGaslessTonTransferQuoteQueryKey(resolvedOptions, walletAddress),
    };
};

export type GetGaslessTonTransferQuoteQueryFnData = Compute<Awaited<GetGaslessTonTransferQuoteReturnType>>;

export type GetGaslessTonTransferQuoteData = GetGaslessTonTransferQuoteQueryFnData;

export const getGaslessTonTransferQuoteQueryKey = (
    options: Compute<ExactPartial<GetGaslessTonTransferQuoteOptions>> = {},
    walletAddress?: string,
): GetGaslessTonTransferQuoteQueryKey => {
    return [
        'gaslessTonTransferQuote',
        filterQueryOptions(options as unknown as Record<string, unknown>),
        walletAddress,
    ] as const;
};

export type GetGaslessTonTransferQuoteQueryKey = readonly [
    'gaslessTonTransferQuote',
    Compute<ExactPartial<GetGaslessTonTransferQuoteOptions>>,
    string | undefined,
];

export type GetGaslessTonTransferQuoteQueryOptions<selectData = GetGaslessTonTransferQuoteData> = QueryOptions<
    GetGaslessTonTransferQuoteQueryFnData,
    GetGaslessTonTransferQuoteErrorType,
    selectData,
    GetGaslessTonTransferQuoteQueryKey
>;
