/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GetBalanceOptions } from '@ton/appkit/queries';
import { getBalanceQueryOptions } from '@ton/appkit/queries';
import { useQuery } from '@tanstack/react-query';

import { useAppKit } from '../../../hooks/use-app-kit';

/**
 * Hook to get balance
 */
export function useBalance(params: GetBalanceOptions, queryOptions?: Record<string, unknown>) {
    const appKit = useAppKit();

    return useQuery({
        ...getBalanceQueryOptions(appKit, params),
        ...queryOptions,
    });
}
