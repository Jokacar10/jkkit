/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Configuration options for DeDustSwapProvider
 */
export interface DeDustSwapProviderConfig {
    /**
     * Custom provider ID (defaults to 'dedust')
     */
    providerId?: string;

    /**
     * Default slippage tolerance in basis points (1 bp = 0.01%)
     * @default 100 (1%)
     */
    defaultSlippageBps?: number;

    /**
     * API base URL
     * @default 'https://api-mainnet.dedust.io'
     */
    apiUrl?: string;

    /**
     * Referral address for fee sharing
     */
    referralAddress?: string;

    /**
     * Referral fee in basis points (max 100 = 1%)
     */
    referralFeeBps?: number;

    /**
     * Only use verified pools
     * @default true
     */
    onlyVerifiedPools?: boolean;

    /**
     * Maximum number of route splits
     * @default 4
     */
    maxSplits?: number;

    /**
     * Maximum route length (hops)
     * @default 3
     */
    maxLength?: number;

    /**
     * Minimum pool TVL in USD
     * @default '5000'
     */
    minPoolUsdTvl?: string;
}

/**
 * Route step from DeDust Router API
 */
export interface DeDustRouteStep {
    pool_address: string;
    is_stable: boolean;
    in_minter: string;
    out_minter: string;
    in_amount: string;
    out_amount: string;
    network_fee: string;
    protocol_slug: string;
    stonfi_extra_details?: {
        router: string;
        from_router_wallet: string;
        to_router_wallet: string;
    };
}

/**
 * Swap data from DeDust Router API quote response
 */
export interface DeDustSwapData {
    slippage_bps: number;
    routes: DeDustRouteStep[][];
}

/**
 * Quote response from DeDust Router API
 */
export interface DeDustQuoteResponse {
    in_amount: string;
    out_amount: string;
    swap_data: DeDustSwapData;
    swap_is_possible: boolean;
    price_impact?: number;
    improvement?: string;
    in_minter_price?: string;
    out_minter_price?: string;
}

/**
 * Swap request to DeDust Router API
 */
export interface DeDustSwapRequest {
    sender_address: string;
    swap_data: {
        slippage_bps: number;
        routes: DeDustRouteStep[];
    };
    referral_address?: string;
    referral_fee?: number;
    jetton_wallet_state_init?: string;
    custom_payload?: string;
}

/**
 * Swap transaction from DeDust Router API
 */
export interface DeDustSwapTransaction {
    address: string;
    amount: string;
    payload: string;
    state_init?: string;
}

/**
 * Swap response from DeDust Router API
 */
export interface DeDustSwapResponse {
    query_id: number;
    transactions: DeDustSwapTransaction[];
}

/**
 * Metadata stored in SwapQuote for DeDust provider
 */
export interface DeDustQuoteMetadata {
    /**
     * Raw quote response from API
     */
    quoteResponse: DeDustQuoteResponse;

    /**
     * Slippage used for the quote in basis points
     */
    slippageBps: number;
}

/**
 * Provider-specific options for DeDust swap operations
 */
export interface DeDustProviderOptions {
    /**
     * Protocols to use for routing
     * Available: 'dedust', 'dedust_v3', 'dedust_v3_memepad', 'stonfi_v1', 'stonfi_v2', 'tonco', 'memeslab', 'tonfun'
     * @default all protocols
     */
    protocols?: string[];

    /**
     * Protocols to exclude from routing
     */
    excludeProtocols?: string[];

    /**
     * Only use verified pools
     */
    onlyVerifiedPools?: boolean;

    /**
     * Maximum number of route splits
     */
    maxSplits?: number;

    /**
     * Maximum route length (hops)
     */
    maxLength?: number;

    /**
     * Exclude volatile pools
     */
    excludeVolatilePools?: boolean;

    /**
     * Custom referral address (overrides config)
     */
    referralAddress?: string;

    /**
     * Custom referral fee in basis points (overrides config)
     */
    referralFeeBps?: number;
}
