/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Cell, loadMessage } from '@ton/core';

import type { ApiClient } from '../../types/toncenter/ApiClient';
import type { TransactionStatusResponse } from '../../api/models';
import { getNormalizedExtMessageHash } from '../getNormalizedExtMessageHash';
import { parseTraceResponse } from './parseTraceResponse';

/**
 * Get the status of a transaction by its BOC.
 *
 * In TON, a single external message triggers a tree of internal messages.
 * The transaction is "complete" only when the entire trace finishes.
 */
export async function getTransactionStatus(client: ApiClient, boc: string): Promise<TransactionStatusResponse> {
    // Parse the BOC to get the external message hash
    const cell = Cell.fromBase64(boc);
    const message = loadMessage(cell.beginParse());
    const hash =
        message.info.type === 'external-in'
            ? getNormalizedExtMessageHash(message).toString('base64')
            : cell.hash().toString('base64');

    // First try pending traces (transaction still being processed)
    try {
        const pendingResponse = await client.getPendingTrace({ externalMessageHash: [hash] });
        const pendingStatus = parseTraceResponse(pendingResponse);
        if (pendingStatus) return pendingStatus;
    } catch (_e) {
        // ignore
    }

    // Try completed traces
    try {
        const traceResponse = await client.getTrace({ traceId: [hash] });
        const completedStatus = parseTraceResponse(traceResponse);
        if (completedStatus) return completedStatus;
    } catch (_e) {
        // ignore
    }

    // If neither pending nor completed trace found, the transaction
    // is likely still propagating to the network
    return {
        status: 'pending',
        totalMessages: 0,
        pendingMessages: 0,
        completedMessages: 0,
    };
}
