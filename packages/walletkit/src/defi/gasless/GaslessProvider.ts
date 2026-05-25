/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessProviderInterface } from '../../api/interfaces';
import type { GaslessConfig, GaslessQuote, GaslessQuoteParams, GaslessSendParams, Network } from '../../api/models';

/**
 * Abstract base class for gasless relay providers.
 *
 * Concrete providers (e.g. TonApiGaslessProvider) implement the three methods
 * below against a specific relayer backend.
 *
 * @example
 * ```typescript
 * class MyGaslessProvider extends GaslessProvider {
 *   readonly providerId = 'my-relayer';
 *
 *   async getConfig(network: Network): Promise<GaslessConfig> { ... }
 *   async getQuote(params): Promise<GaslessQuote> { ... }
 *   async sendTransaction(params): Promise<void> { ... }
 * }
 * ```
 */
export abstract class GaslessProvider implements GaslessProviderInterface {
    readonly type = 'gasless';
    abstract readonly providerId: string;

    abstract getSupportedNetworks(): Network[];
    abstract getConfig(network: Network): Promise<GaslessConfig>;
    abstract getQuote(params: GaslessQuoteParams): Promise<GaslessQuote>;
    abstract sendTransaction(params: GaslessSendParams): Promise<void>;
}
