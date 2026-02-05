/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { DefiManagerAPI } from '../types';
import type { Network, TransactionRequest, UserFriendlyAddress, TokenAmount } from '../../api/models';

/**
 * Base parameters for requesting a swap quote
 */
export interface SwapQuoteParams<TProviderOptions = unknown> {
    amount: TokenAmount;
    fromToken: SwapToken;
    toToken: SwapToken;
    network: Network;
    slippageBps?: number;
    maxOutgoingMessages?: number;
    providerOptions?: TProviderOptions;
    isReverseSwap?: boolean;
}

/**
 * Token type for swap
 */
export type SwapToken = { type: 'jetton'; address: UserFriendlyAddress } | { type: 'ton' };

/**
 * Swap quote response with pricing information
 */
export interface SwapQuote {
    fromToken: SwapToken;
    toToken: SwapToken;
    fromAmount: TokenAmount;
    toAmount: TokenAmount;
    minReceived: TokenAmount;
    network: Network;
    priceImpact?: number;
    fee?: SwapFee[];
    provider: string;
    expiresAt?: number; // Unix timestamp in seconds
    metadata?: unknown;
}

/**
 * Fee information for swap
 */
export interface SwapFee {
    amount: TokenAmount;
    token: SwapToken;
}

/**
 * Parameters for building swap transaction
 */
export interface SwapParams<TProviderOptions = unknown> {
    quote: SwapQuote;
    userAddress: UserFriendlyAddress;
    destinationAddress?: UserFriendlyAddress;
    slippageBps?: number;
    deadline?: number;
    providerOptions?: TProviderOptions;
}

/**
 * Swap API interface exposed by SwapManager
 */
export interface SwapAPI extends DefiManagerAPI<SwapProviderInterface> {
    getQuote(params: SwapQuoteParams, provider?: string): Promise<SwapQuote>;
    buildSwapTransaction(params: SwapParams, provider?: string): Promise<TransactionRequest>;
}

/**
 * Interface that all swap providers must implement
 */
export interface SwapProviderInterface<TQuoteOptions = unknown, TSwapOptions = unknown> {
    getQuote(params: SwapQuoteParams<TQuoteOptions>): Promise<SwapQuote>;
    buildSwapTransaction(params: SwapParams<TSwapOptions>): Promise<TransactionRequest>;
}
