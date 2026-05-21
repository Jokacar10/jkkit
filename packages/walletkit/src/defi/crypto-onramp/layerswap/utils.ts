/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampDestinationCurrency, CryptoOnrampStatus } from '../../../api/models';
import { Caip2ByNetwork } from '../caip2';
import { CryptoOnrampError } from '../errors';
import type { LayerswapErrorResponse, LayerswapSwapStatus } from './types';

export const LAYERSWAP_DESTINATION_NETWORK = 'TON_MAINNET';

/**
 * Per-source-chain configuration for Layerswap.
 */
export interface LayerswapChainConfig {
    /** Layerswap network slug, e.g. `'ETHEREUM_MAINNET'`. */
    slug: string;
    /**
     * Source-format regex (string form) used to validate the optional `refundAddress`
     * supplied for this chain. Stored as a string so overrides stay easy to serialize.
     * Format-only — checksums are not verified here; Layerswap's API does that.
     */
    addressRegex: string;
}

const EVM_ADDRESS_REGEX = '^0x[0-9a-fA-F]{40}$';
const SOLANA_ADDRESS_REGEX = '^[1-9A-HJ-NP-Za-km-z]{32,44}$';
const BITCOIN_ADDRESS_REGEX = '^([13][1-9A-HJ-NP-Za-km-z]{25,34}|bc1[02-9ac-hj-np-z]{6,87})$';
const TRON_ADDRESS_REGEX = '^T[1-9A-HJ-NP-Za-km-z]{33}$';

/**
 * Default mapping of CAIP-2 source chains to Layerswap network configs.
 * Used by `LayerswapCryptoOnrampProvider` when no override is passed via config.
 * Exported so consumers can spread/extend it rather than redefining from scratch.
 */
export const DEFAULT_LAYERSWAP_SUPPORTED_CHAINS: Record<string, LayerswapChainConfig> = {
    [Caip2ByNetwork.EthereumMainnet]: { slug: 'ETHEREUM_MAINNET', addressRegex: EVM_ADDRESS_REGEX },
    [Caip2ByNetwork.OptimismMainnet]: { slug: 'OPTIMISM_MAINNET', addressRegex: EVM_ADDRESS_REGEX },
    [Caip2ByNetwork.BscMainnet]: { slug: 'BSC_MAINNET', addressRegex: EVM_ADDRESS_REGEX },
    [Caip2ByNetwork.PolygonMainnet]: { slug: 'POLYGON_MAINNET', addressRegex: EVM_ADDRESS_REGEX },
    [Caip2ByNetwork.BaseMainnet]: { slug: 'BASE_MAINNET', addressRegex: EVM_ADDRESS_REGEX },
    [Caip2ByNetwork.ArbitrumMainnet]: { slug: 'ARBITRUM_MAINNET', addressRegex: EVM_ADDRESS_REGEX },
    [Caip2ByNetwork.AvalancheMainnet]: { slug: 'AVALANCHE_MAINNET', addressRegex: EVM_ADDRESS_REGEX },
    [Caip2ByNetwork.SolanaMainnet]: { slug: 'SOLANA_MAINNET', addressRegex: SOLANA_ADDRESS_REGEX },
    [Caip2ByNetwork.BitcoinMainnet]: { slug: 'BITCOIN_MAINNET', addressRegex: BITCOIN_ADDRESS_REGEX },
    [Caip2ByNetwork.TronMainnet]: { slug: 'TRON_MAINNET', addressRegex: TRON_ADDRESS_REGEX },
};

/**
 * Default set of TON-side destination tokens queried via `/sources`. Drives which
 * source (chain, token) pairs the provider discovers — Layerswap is asked for each
 * destination token in turn, and the union is returned from `getSupportedCurrencies`.
 * Exported so consumers can spread/extend it.
 */
export const LAYERSWAP_DESTINATION_TOKENS: CryptoOnrampDestinationCurrency[] = [
    {
        address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        symbol: 'USDT',
        name: 'Tether',
        decimals: 6,
        logo: 'https://cdn.layerswap.io/layerswap/currencies/usdt.png',
    },
];

export const isErrorResponse = (body: unknown): body is LayerswapErrorResponse => {
    return (
        typeof body === 'object' &&
        body !== null &&
        typeof (body as { error?: unknown }).error === 'object' &&
        (body as { error: { message?: unknown } }).error !== null
    );
};

/**
 * Translate a Layerswap-specific API error code into a provider-agnostic CryptoOnrampError code.
 * Falls back to the original code when there is no known mapping.
 */
export const mapLayerswapErrorCode = (apiCode: string | undefined, fallback: string): string => {
    switch (apiCode) {
        case 'ROUTE_NOT_FOUND_ERROR':
            return CryptoOnrampError.ROUTE_NOT_FOUND;
        default:
            return apiCode ?? fallback;
    }
};

export const mapStatus = (status: LayerswapSwapStatus | string): CryptoOnrampStatus => {
    switch (status) {
        case 'completed':
        case 'user_payout_completed':
        case 'payout_completed':
            return 'success';
        case 'user_transfer_pending':
        case 'user_transfer_delayed':
        case 'ls_transfer_pending':
        case 'initiated':
        case 'created':
            return 'pending';
        case 'expired':
        case 'failed':
        case 'cancelled':
        case 'refunded':
        case 'requires_refund':
            return 'failed';
        default:
            return 'pending';
    }
};

/**
 * Format a base-units integer string into a decimal token-units string.
 * e.g. formatBaseUnits('2000000', 6) === '2'
 */
export const formatBaseUnits = (base: string, decimals: number): string => {
    if (!/^\d+$/.test(base)) {
        throw new Error(`formatBaseUnits: not a non-negative integer string: "${base}"`);
    }
    if (decimals === 0) return base;
    const padded = base.padStart(decimals + 1, '0');
    const whole = padded.slice(0, padded.length - decimals);
    const frac = padded.slice(padded.length - decimals).replace(/0+$/, '');
    return frac.length > 0 ? `${whole}.${frac}` : whole;
};

/**
 * Scale a decimal token-units string by 10^decimals and return the integer
 * base-units string, truncating any excess fractional digits.
 */
export const parseBaseUnits = (value: number | string, decimals: number): string => {
    const str = typeof value === 'number' ? value.toString() : value;
    if (!/^\d+(\.\d+)?$/.test(str)) {
        throw new Error(`parseBaseUnits: not a non-negative decimal: "${str}"`);
    }
    const [whole, frac = ''] = str.split('.');
    const truncated = frac.slice(0, decimals).padEnd(decimals, '0');
    const combined = `${whole}${truncated}`.replace(/^0+/, '');
    return combined.length > 0 ? combined : '0';
};
