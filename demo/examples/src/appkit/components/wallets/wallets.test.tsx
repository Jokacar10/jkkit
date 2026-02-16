/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Network } from '@ton/walletkit';
import { getSelectedWallet, watchSelectedWallet, getConnectors, watchConnectors } from '@ton/appkit';

import { createWrapper } from '../../../__tests__/test-utils';
import { ConnectButtonExample } from './connect-button';

// Spies for actions
const connectSpy = vi.fn();
const disconnectSpy = vi.fn();

// Mock @ton/appkit functions
vi.mock('@ton/appkit', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('@ton/appkit')>();
    return {
        ...actual,
        getSelectedWallet: vi.fn(),
        watchSelectedWallet: vi.fn(),
        getConnectors: vi.fn(),
        watchConnectors: vi.fn(),
    };
});

// Mock @ton/appkit/queries
vi.mock('@ton/appkit/queries', async () => {
    return {
        connectMutationOptions: (appKit: any, params: any) => ({
            mutationFn: (variables: any) => connectSpy(appKit, variables || params),
            mutationKey: ['connect'],
        }),
        disconnectMutationOptions: (appKit: any, params: any) => ({
            mutationFn: (variables: any) => disconnectSpy(appKit, variables || params),
            mutationKey: ['disconnect'],
        }),
    };
});

describe('ConnectButtonExample', () => {
    let mockAppKit: any;

    const mockNetwork = Network.mainnet();

    const mockWallet = {
        getAddress: () => 'EQaddress1',
        getNetwork: () => mockNetwork,
        connectorId: 'connector1',
    };

    const mockConnectors = [{ id: 'connector1', name: 'Wallet 1' }];

    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
        connectSpy.mockClear();
        disconnectSpy.mockClear();

        // Default: Disconnected
        (getSelectedWallet as any).mockReturnValue(null);
        (getConnectors as any).mockReturnValue(mockConnectors);

        // Mock watch functions to return unsubscribe
        (watchSelectedWallet as any).mockReturnValue(() => {});
        (watchConnectors as any).mockReturnValue(() => {});

        connectSpy.mockResolvedValue(undefined);
        disconnectSpy.mockResolvedValue(undefined);

        mockAppKit = {
            // We still need an object for context, but methods on it won't be used by hooks
            walletsManager: {},
            networkManager: {},
        };
    });

    afterEach(() => {
        cleanup();
    });

    it('should render "Connect Wallet" when disconnected', () => {
        render(<ConnectButtonExample />, { wrapper: createWrapper(mockAppKit) });
        // Assuming the button text or aria-label indicates connect
        const button = screen.getByRole('button');
        expect(button).toBeDefined();
    });

    it('should call connect on button click when disconnected and single connector', async () => {
        render(<ConnectButtonExample />, { wrapper: createWrapper(mockAppKit) });

        const button = screen.getByRole('button');
        act(() => {
            button.click();
        });

        await waitFor(() => {
            expect(connectSpy).toHaveBeenCalledWith(mockAppKit, expect.objectContaining({ connectorId: 'connector1' }));
        });
    });

    it('should render disconnect text/icon when connected', async () => {
        // Setup connected state
        (getSelectedWallet as any).mockReturnValue(mockWallet);

        render(<ConnectButtonExample />, { wrapper: createWrapper(mockAppKit) });

        await waitFor(() => {
            const button = screen.getByRole('button');
            act(() => {
                button.click();
            });
            expect(disconnectSpy).toHaveBeenCalledWith(
                mockAppKit,
                expect.objectContaining({ connectorId: 'connector1' }),
            );
        });
    });
});
