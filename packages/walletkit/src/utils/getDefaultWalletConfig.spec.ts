/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect } from 'vitest';

import { getDeviceInfoForWallet } from './getDefaultWalletConfig';
import type { WalletAdapter } from '../api/interfaces';
import type { Feature } from '../types/jsBridge';

describe('getDeviceInfoForWallet', () => {
    it('should return default deviceInfo when wallet adapter does not have getSupportedFeatures', () => {
        const mockAdapter = {
            getPublicKey: () => '0x123',
            getNetwork: () => ({ chainId: -239 }),
        } as unknown as WalletAdapter;

        const deviceInfo = getDeviceInfoForWallet(mockAdapter);

        expect(deviceInfo.features).toEqual([
            'SendTransaction',
            {
                name: 'SendTransaction',
                maxMessages: 1,
            },
        ]);
    });

    it('should not add SendTransaction when adapter has no SendTransaction features', () => {
        const customFeatures: Feature[] = [
            {
                name: 'SignData',
                types: ['binary'],
            },
        ];

        const mockLedgerAdapter = {
            getPublicKey: () => '0x123',
            getNetwork: () => ({ chainId: -239 }),
            getSupportedFeatures: () => customFeatures,
        } as unknown as WalletAdapter;

        const deviceInfo = getDeviceInfoForWallet(mockLedgerAdapter);

        expect(deviceInfo.features).toEqual([
            {
                name: 'SignData',
                types: ['binary'],
            },
        ]);
    });

    it('should not duplicate SendTransaction when adapter already has it as string', () => {
        const customFeatures: Feature[] = [
            'SendTransaction',
            {
                name: 'SignData',
                types: ['binary'],
            },
        ];

        const mockAdapter = {
            getPublicKey: () => '0x123',
            getNetwork: () => ({ chainId: -239 }),
            getSupportedFeatures: () => customFeatures,
        } as unknown as WalletAdapter;

        const deviceInfo = getDeviceInfoForWallet(mockAdapter);

        expect(deviceInfo.features).toEqual([
            'SendTransaction',
            {
                name: 'SignData',
                types: ['binary'],
            },
        ]);
    });

    it('should add SendTransaction string when adapter has only SendTransaction object', () => {
        const customFeatures: Feature[] = [
            {
                name: 'SendTransaction',
                maxMessages: 4,
            },
            {
                name: 'SignData',
                types: ['binary'],
            },
        ];

        const mockAdapter = {
            getPublicKey: () => '0x123',
            getNetwork: () => ({ chainId: -239 }),
            getSupportedFeatures: () => customFeatures,
        } as unknown as WalletAdapter;

        const deviceInfo = getDeviceInfoForWallet(mockAdapter);

        expect(deviceInfo.features).toEqual([
            'SendTransaction',
            {
                name: 'SendTransaction',
                maxMessages: 4,
            },
            {
                name: 'SignData',
                types: ['binary'],
            },
        ]);
    });

    it('should not duplicate SendTransaction when adapter has both string and object forms', () => {
        const customFeatures: Feature[] = [
            'SendTransaction',
            {
                name: 'SendTransaction',
                maxMessages: 4,
            },
            {
                name: 'SignData',
                types: ['binary'],
            },
        ];

        const mockAdapter = {
            getPublicKey: () => '0x123',
            getNetwork: () => ({ chainId: -239 }),
            getSupportedFeatures: () => customFeatures,
        } as unknown as WalletAdapter;

        const deviceInfo = getDeviceInfoForWallet(mockAdapter);

        expect(deviceInfo.features).toEqual([
            'SendTransaction',
            {
                name: 'SendTransaction',
                maxMessages: 4,
            },
            {
                name: 'SignData',
                types: ['binary'],
            },
        ]);
    });
});
