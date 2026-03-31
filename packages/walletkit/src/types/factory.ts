/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { DefiProvider } from '../api/interfaces';
import type { NetworkManager } from '../core/NetworkManager';

/**
 * Context passed to provider factory functions.
 */
export interface ProviderFactoryContext {
    networkManager: NetworkManager;
    ssr?: boolean;
}

/** Factory function that creates a provider from context */
export type ProviderFactory = (ctx: ProviderFactoryContext) => DefiProvider;

/** A provider instance or a factory that creates one */
export type ProviderInput = DefiProvider | ProviderFactory;

/** Helper for creating typed provider factories */
export function createProvider(factory: ProviderFactory): ProviderFactory {
    return factory;
}

/** @internal Resolves a ProviderInput to a provider instance */
export function resolveProvider(input: ProviderInput, ctx: ProviderFactoryContext): DefiProvider {
    return typeof input === 'function' ? input(ctx) : input;
}
