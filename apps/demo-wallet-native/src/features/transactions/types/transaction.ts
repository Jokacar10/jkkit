/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export interface Transaction {
    id: string;
    messageHash: string;
    type: 'send' | 'receive';
    amount: string;
    address: string;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
    traceId?: string;
    externalMessageHash?: string;
    fees?: string;
}
