/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { UserFriendlyAddress } from '../core/Primitives';
import type { GaslessSupportedAsset } from './GaslessSupportedAsset';

/**
 * Relayer configuration for gasless transactions.
 *
 * Reports which assets the relayer accepts as fee payment and the address
 * where the relayer fee is routed. `supportedAssets` may be empty for
 * free / sponsored providers that do not charge a per-transaction fee.
 */
export interface GaslessConfig {
    /** Address where the relayer expects to receive the fee */
    relayAddress: UserFriendlyAddress;
    /**
     * Assets the relayer accepts as fee payment. Currently jetton masters
     * for TonAPI; future providers may advertise NFT items or other assets.
     */
    supportedAssets: GaslessSupportedAsset[];
}
