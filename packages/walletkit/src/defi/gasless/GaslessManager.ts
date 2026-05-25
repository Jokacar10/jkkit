/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessAPI, GaslessProviderInterface } from '../../api/interfaces';
import type { GaslessConfig, GaslessQuote, GaslessQuoteParams, GaslessSendParams } from '../../api/models';
import { globalLogger } from '../../core/Logger';
import type { ProviderFactoryContext } from '../../types/factory';
import { DefiManager } from '../DefiManager';
import type { GaslessErrorCode } from './errors';
import { GaslessError } from './errors';

const log = globalLogger.createChild('GaslessManager');

/**
 * GaslessManager — manages gasless relay providers and delegates gasless operations.
 *
 * Allows registration of multiple gasless providers and provides a unified API.
 * Providers can be switched dynamically.
 */
export class GaslessManager extends DefiManager<GaslessProviderInterface> implements GaslessAPI {
    constructor(createFactoryContext: () => ProviderFactoryContext) {
        super(createFactoryContext);
    }

    /**
     * Fetch relayer configuration (supported jettons and relay address).
     */
    async getConfig(providerId?: string): Promise<GaslessConfig> {
        log.debug('Getting gasless config', { providerId: providerId ?? this.defaultProviderId });

        try {
            return await this.getProvider(providerId ?? this.defaultProviderId).getConfig();
        } catch (error) {
            log.error('Failed to get gasless config', { error });
            throw error;
        }
    }

    /**
     * Quote fees and obtain relayer-wrapped messages for signing.
     */
    async getQuote(params: GaslessQuoteParams, providerId?: string): Promise<GaslessQuote> {
        log.debug('Quoting gasless transaction', {
            walletAddress: params.walletAddress,
            feeJettonMaster: params.feeJettonMaster,
            messagesCount: params.messages.length,
            providerId: providerId ?? this.defaultProviderId,
        });

        try {
            return await this.getProvider(providerId ?? this.defaultProviderId).getQuote(params);
        } catch (error) {
            log.error('Failed to quote gasless transaction', { error, params });
            throw error;
        }
    }

    /**
     * Submit a signed transaction BoC to the relayer.
     */
    async sendTransaction(params: GaslessSendParams, providerId?: string): Promise<void> {
        log.debug('Sending gasless transaction', { providerId: providerId ?? this.defaultProviderId });

        try {
            await this.getProvider(providerId ?? this.defaultProviderId).sendTransaction(params);
        } catch (error) {
            log.error('Failed to send gasless transaction', { error });
            throw error;
        }
    }

    protected createError(message: string, code: string, details?: unknown): GaslessError {
        return new GaslessError(message, code as GaslessErrorCode, details);
    }
}
