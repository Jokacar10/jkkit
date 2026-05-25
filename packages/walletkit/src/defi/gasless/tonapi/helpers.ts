/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Network } from '../../../api/models';
import { TonClientError } from '../../../clients/TonClientError';

/**
 * Reconstruct a `Network` instance from a chainId string. Used to map
 * `Object.keys(chainConfig)` back to `Network` objects.
 */
export const networkFromChainId = (chainId: string): Network => {
    switch (chainId) {
        case Network.mainnet().chainId:
            return Network.mainnet();
        case Network.testnet().chainId:
            return Network.testnet();
        case Network.tetra().chainId:
            return Network.tetra();
        default:
            return Network.custom(chainId);
    }
};

/**
 * Decide whether a `/v2/gasless/send` failure is worth retrying.
 *
 * Retry on 5xx server errors and HTTP 408/429 (timeout / rate limit), and on
 * non-HTTP errors (network failures: fetch `TypeError`, `AbortError`).
 *
 * Skip retry on 4xx client errors — they will not improve, and re-sending a
 * BoC that was actually accepted would burn relayer gas on a duplicate
 * (although the wallet's seqno guard prevents on-chain double-spend).
 */
export const isTransientError = (error: unknown): boolean => {
    if (error instanceof TonClientError) {
        return error.status >= 500 || error.status === 408 || error.status === 429;
    }
    return error instanceof Error;
};
