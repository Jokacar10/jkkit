/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TokenAmount } from '@ton/walletkit';

import { createWrapper } from '../../../__tests__/test-utils';
import { UseBalanceByAddressExample } from './use-balance-by-address';

describe('UseBalanceByAddressExample', () => {
    let mockAppKit: any;
    let mockGetBalance: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockGetBalance = vi.fn();

        mockAppKit = {
            networkManager: {
                getClient: vi.fn().mockReturnValue({
                    getBalance: mockGetBalance,
                }),
            },
        };
    });

    it('should render loading state initially', async () => {
        // Return a promise that never resolves to simulate loading
        mockGetBalance.mockReturnValue(new Promise(() => {}));

        render(<UseBalanceByAddressExample />, {
            wrapper: createWrapper(mockAppKit),
        });

        expect(screen.getByText('Loading...')).toBeDefined();
    });

    it('should render balance when data is available', async () => {
        const mockBalance = {
            toString: () => '1000000000',
        } as TokenAmount;

        mockGetBalance.mockResolvedValue(mockBalance);

        render(<UseBalanceByAddressExample />, {
            wrapper: createWrapper(mockAppKit),
        });

        // Wait for loading to finish and balance to appear
        await waitFor(() => {
            expect(screen.getByText('Balance: 1000000000')).toBeDefined();
        });
    });

    it('should render error message on failure', async () => {
        mockGetBalance.mockRejectedValue(new Error('Network error'));

        render(<UseBalanceByAddressExample />, {
            wrapper: createWrapper(mockAppKit),
        });

        await waitFor(() => {
            expect(screen.getByText('Error: Network error')).toBeDefined();
        });
    });
});
