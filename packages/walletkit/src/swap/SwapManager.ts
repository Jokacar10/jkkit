/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TransactionRequest } from '../api/models';
import type { SwapAPI, SwapQuoteParams, SwapQuote, SwapParams, SwapProviderInterface } from './types';
import { SwapError, SwapErrorCode } from './errors';
import { globalLogger } from '../core/Logger';

const log = globalLogger.createChild('SwapManager');

/**
 * SwapManager - manages swap providers and delegates swap operations
 *
 * Allows registration of multiple swap providers and provides a unified API
 * for swap operations. Providers can be switched dynamically.
 */
export class SwapManager implements SwapAPI {
    private providers: Map<string, SwapProviderInterface> = new Map();
    private defaultProvider?: string;

    constructor() {
        log.info('SwapManager initialized');
    }

    /**
     * Register a swap provider
     * @param name - Unique name for the provider
     * @param provider - Provider instance
     */
    registerProvider(name: string, provider: SwapProviderInterface): void {
        this.providers.set(name, provider);

        if (!this.defaultProvider) {
            this.defaultProvider = name;
            log.info('Set default swap provider', { provider: name });
        }

        log.info('Registered swap provider', { provider: name });
    }

    /**
     * Set the default provider to use when none is specified
     * @param name - Provider name
     * @throws SwapError if provider not found
     */
    setDefaultProvider(name: string): void {
        if (!this.providers.has(name)) {
            throw new SwapError(`Provider '${name}' not registered`, SwapErrorCode.PROVIDER_NOT_FOUND, {
                provider: name,
                registered: Array.from(this.providers.keys()),
            });
        }
        this.defaultProvider = name;
        log.info('Changed default swap provider', { provider: name });
    }

    /**
     * Get a provider by name, or the default provider
     * @param name - Optional provider name
     * @returns Provider instance
     * @throws SwapError if provider not found or no default set
     */
    getProvider(name?: string): SwapProviderInterface {
        const providerName = name || this.defaultProvider;

        if (!providerName) {
            throw new SwapError(
                'No default provider set. Register a provider first.',
                SwapErrorCode.NO_DEFAULT_PROVIDER,
            );
        }

        const provider = this.providers.get(providerName);
        if (!provider) {
            throw new SwapError(`Provider '${providerName}' not found`, SwapErrorCode.PROVIDER_NOT_FOUND, {
                provider: providerName,
                registered: Array.from(this.providers.keys()),
            });
        }

        return provider;
    }

    /**
     * Get a quote for swapping tokens
     * @param params - Quote parameters
     * @param provider - Optional provider name to use
     * @returns Promise resolving to swap quote
     */
    async getQuote(params: SwapQuoteParams, provider?: string): Promise<SwapQuote> {
        log.debug('Getting swap quote', {
            fromToken: params.fromToken,
            toToken: params.toToken,
            amount: params.amount,
            provider: provider || this.defaultProvider,
        });

        try {
            const quote = await this.getProvider(provider).getQuote(params);

            log.debug('Received swap quote', {
                fromAmount: quote.fromAmount,
                toAmount: quote.toAmount,
                priceImpact: quote.priceImpact,
            });

            return quote;
        } catch (error) {
            log.error('Failed to get swap quote', { error, params });
            throw error;
        }
    }

    /**
     * Build a transaction for executing a swap
     * @param params - Swap parameters including quote
     * @param provider - Optional provider name to use
     * @returns Promise resolving to transaction request
     */
    async buildSwapTransaction(params: SwapParams, provider?: string): Promise<TransactionRequest> {
        log.debug('Building swap transaction', {
            userAddress: params.userAddress,
            provider: provider || this.defaultProvider,
        });

        try {
            const transaction = await this.getProvider(provider).buildSwapTransaction(params);

            log.debug('Built swap transaction', params.quote);

            return transaction;
        } catch (error) {
            log.error('Failed to build swap transaction', { error, params });
            throw error;
        }
    }

    /**
     * Get list of registered provider names
     * @returns Array of provider names
     */
    getRegisteredProviders(): string[] {
        return Array.from(this.providers.keys());
    }

    /**
     * Check if a provider is registered
     * @param name - Provider name
     * @returns True if provider exists
     */
    hasProvider(name: string): boolean {
        return this.providers.has(name);
    }
}
