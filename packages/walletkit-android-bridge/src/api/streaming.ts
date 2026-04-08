/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    StreamingProvider,
    StreamingUpdate,
    StreamingWatchType,
    TonApiStreamingProviderConfig,
    TonCenterStreamingProviderConfig,
} from '@ton/walletkit';
import { TonApiStreamingProvider, TonCenterStreamingProvider } from '@ton/walletkit';

import { emit } from '../transport/messaging';
import { getKit } from '../utils/bridge';
import { get, release, retain } from '../utils/registry';

export async function createTonCenterStreamingProvider(args: { config: TonCenterStreamingProviderConfig }) {
    const instance = await getKit();
    const provider = new TonCenterStreamingProvider(instance.createFactoryContext(), args.config);
    return { providerId: retain('streamingProvider', provider) };
}

export async function createTonApiStreamingProvider(args: { config: TonApiStreamingProviderConfig }) {
    const instance = await getKit();
    const provider = new TonApiStreamingProvider(instance.createFactoryContext(), args.config);
    return { providerId: retain('streamingProvider', provider) };
}

export async function registerStreamingProvider(args: { providerId: string }) {
    const instance = await getKit();
    const provider = get<StreamingProvider>(args.providerId);
    if (!provider) throw new Error(`Streaming provider not found: ${args.providerId}`);
    instance.streaming.registerProvider(() => provider);
}

export async function streamingHasProvider(args: { network: { chainId: string } }) {
    const instance = await getKit();
    return { hasProvider: instance.streaming.hasProvider(args.network) };
}

export async function streamingWatch(args: {
    network: { chainId: string };
    address: string;
    types: StreamingWatchType[];
}) {
    const instance = await getKit();
    let subscriptionId: string;
    const unwatch = instance.streaming.watch(
        args.network,
        args.address,
        args.types as Exclude<StreamingWatchType, 'trace'>[],
        (_type: StreamingWatchType, update: StreamingUpdate) => {
            emit('streamingUpdate', { subscriptionId, update });
        },
    );
    subscriptionId = retain('streamingSub', unwatch);
    return { subscriptionId };
}

export async function streamingUnwatch(args: { subscriptionId: string }) {
    const unwatch = get<() => void>(args.subscriptionId);
    if (unwatch) {
        unwatch();
        release(args.subscriptionId);
    }
}

export async function streamingConnect() {
    const instance = await getKit();
    instance.streaming.connect();
}

export async function streamingDisconnect() {
    const instance = await getKit();
    instance.streaming.disconnect();
}

export async function streamingWatchConnectionChange(args: { network: { chainId: string } }) {
    const instance = await getKit();
    let subscriptionId: string;
    const unwatch = instance.streaming.onConnectionChange(args.network, (connected: boolean) => {
        emit('streamingConnectionChange', { subscriptionId, connected });
    });
    subscriptionId = retain('streamingSub', unwatch);
    return { subscriptionId };
}
