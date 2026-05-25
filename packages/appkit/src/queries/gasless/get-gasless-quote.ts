/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getGaslessQuote } from '../../actions/gasless/get-gasless-quote';
import type {
    GetGaslessQuoteErrorType,
    GetGaslessQuoteOptions,
    GetGaslessQuoteReturnType,
} from '../../actions/gasless/get-gasless-quote';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type { GetGaslessQuoteErrorType };

/**
 * Default time-to-live for a gasless quote. The relayer returns its own
 * `validUntil`; this is the upper bound used by react-query to refresh the
 * quote before it expires.
 */
export const GASLESS_QUOTE_STALE_TIME_MS = 2 * 60 * 1000;

export type GetGaslessQuoteQueryConfig<selectData = GetGaslessQuoteData> = Compute<
    ExactPartial<GetGaslessQuoteOptions>
> &
    QueryParameter<GetGaslessQuoteQueryFnData, GetGaslessQuoteErrorType, selectData, GetGaslessQuoteQueryKey>;

export const getGaslessQuoteQueryOptions = <selectData = GetGaslessQuoteData>(
    appKit: AppKit,
    options: GetGaslessQuoteQueryConfig<selectData> = {},
): GetGaslessQuoteQueryOptions<selectData> => {
    return {
        staleTime: GASLESS_QUOTE_STALE_TIME_MS,
        ...options.query,
        // `feeAsset` is intentionally not part of the gate: free / sponsored
        // providers accept an undefined asset, and jetton-only providers throw
        // a typed error themselves. We only require messages to send.
        enabled: Boolean(options.messages && options.messages.length > 0 && (options.query?.enabled ?? true)),
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetGaslessQuoteOptions];

            if (!parameters.messages || parameters.messages.length === 0) {
                throw new Error('messages is required');
            }

            return getGaslessQuote(appKit, parameters);
        },
        queryKey: getGaslessQuoteQueryKey(options),
    };
};

export type GetGaslessQuoteQueryFnData = Compute<Awaited<GetGaslessQuoteReturnType>>;

export type GetGaslessQuoteData = GetGaslessQuoteQueryFnData;

export const getGaslessQuoteQueryKey = (
    options: Compute<ExactPartial<GetGaslessQuoteOptions>> = {},
): GetGaslessQuoteQueryKey => {
    return ['gaslessQuote', filterQueryOptions(options as unknown as Record<string, unknown>)] as const;
};

export type GetGaslessQuoteQueryKey = readonly ['gaslessQuote', Compute<ExactPartial<GetGaslessQuoteOptions>>];

export type GetGaslessQuoteQueryOptions<selectData = GetGaslessQuoteData> = QueryOptions<
    GetGaslessQuoteQueryFnData,
    GetGaslessQuoteErrorType,
    selectData,
    GetGaslessQuoteQueryKey
>;
