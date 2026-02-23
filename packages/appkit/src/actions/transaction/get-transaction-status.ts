/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Cell, loadMessage } from '@ton/core';

import { Network } from '../../types/network';
import type { AppKit } from '../../core/app-kit';
import { getNormalizedExtMessageHash } from '../../utils';

export type TransactionStatusType = 'pending' | 'completed' | 'failed';

/**
 * A classified action from the transaction trace.
 *
 * Toncenter automatically classifies actions (e.g. jetton_swap, ton_transfer)
 * as the trace progresses. Actions may appear as completed before the entire
 * trace finishes — this allows consumers to detect early completion.
 *
 * @example
 * ```ts
 * // Check if a swap already succeeded while trace is still pending
 * const swapAction = status.actions.find(a => a.type === 'jetton_swap');
 * if (swapAction?.success) {
 *     // Swap is done, remaining messages are cleanup (notifications, excess returns)
 * }
 * ```
 */
export interface TransactionAction {
    /** Action type classified by toncenter (e.g. 'jetton_swap', 'ton_transfer', 'call_contract') */
    type: string;
    /** Whether this action completed successfully */
    success: boolean;
}

export interface TransactionStatusData {
    /** Overall status of the transaction trace */
    status: TransactionStatusType;
    /** Total messages in the trace */
    totalMessages: number;
    /** Messages still pending */
    pendingMessages: number;
    /** Number of completed messages (totalMessages - pendingMessages) */
    completedMessages: number;
    /**
     * Classified actions from the trace.
     *
     * Actions may appear as completed before the entire trace finishes.
     * For example, during a jetton swap the swap action can succeed on message 5/7,
     * while messages 6-7 are just notifications and excess TON returns.
     *
     * Use this to detect early completion for specific action types.
     */
    actions: TransactionAction[];
}

export interface GetTransactionStatusParameters {
    /** BOC of the sent transaction (base64) */
    boc: string;
    /** Network to check the transaction on */
    network?: Network;
}

export type GetTransactionStatusReturnType = TransactionStatusData;

export type GetTransactionStatusErrorType = Error;

/**
 * Maps toncenter trace_state to a simplified status.
 * Known trace_state values: "complete", "pending", "unknown"
 */
const mapTraceState = (traceState: string): TransactionStatusType => {
    switch (traceState) {
        case 'complete':
            return 'completed';
        case 'pending':
            return 'pending';
        default:
            return 'failed';
    }
};

/**
 * Extract classified actions from a trace item's actions array.
 */
const extractActions = (actions?: Array<{ type: string; success: boolean }>): TransactionAction[] => {
    if (!actions) return [];

    return actions.map((action) => ({
        type: action.type,
        success: action.success,
    }));
};

/**
 * Get the status of a transaction by its BOC.
 *
 * In TON, a single external message triggers a tree of internal messages.
 * The transaction is "complete" only when the entire trace finishes.
 * This action checks toncenter's trace endpoints to determine the current status.
 *
 * The `actions` array contains classified actions (e.g. swaps, transfers) that
 * may complete before the entire trace finishes, allowing early completion detection.
 *
 * @example
 * ```ts
 * const result = await sendTransaction(appKit, { messages: [...] });
 * const status = await getTransactionStatus(appKit, { boc: result.boc });
 * // status.status === 'pending' | 'completed' | 'failed'
 * // status.completedMessages === 3
 * // status.totalMessages === 5
 * // status.actions === [{ type: 'jetton_swap', success: true }]
 * ```
 */
export const getTransactionStatus = async (
    appKit: AppKit,
    parameters: GetTransactionStatusParameters,
): Promise<GetTransactionStatusReturnType> => {
    const { boc, network } = parameters;

    // Parse the BOC to get the external message hash
    const cell = Cell.fromBase64(boc);
    const message = loadMessage(cell.beginParse());
    const hash =
        message.info.type === 'external-in'
            ? getNormalizedExtMessageHash(message).toString('base64')
            : cell.hash().toString('base64');

    const client = appKit.networkManager.getClient(network ?? Network.mainnet());

    // First try pending traces (transaction still being processed)
    const pendingResponse = await client.getPendingTrace({
        externalMessageHash: [hash],
    });

    if (pendingResponse.traces.length > 0) {
        const trace = pendingResponse.traces[0];
        const traceInfo = trace.trace_info;

        const isEffectivelyCompleted =
            traceInfo.trace_state === 'complete' ||
            (traceInfo.trace_state === 'pending' && traceInfo.pending_messages === 0);

        return {
            status: isEffectivelyCompleted ? 'completed' : mapTraceState(traceInfo.trace_state),
            totalMessages: traceInfo.messages,
            pendingMessages: traceInfo.pending_messages,
            completedMessages: traceInfo.messages - traceInfo.pending_messages,
            actions: extractActions(trace.actions),
        };
    }

    // Try completed traces
    const traceResponse = await client.getTrace({
        traceId: [hash],
    });

    if (traceResponse.traces.length > 0) {
        const trace = traceResponse.traces[0];
        const traceInfo = trace.trace_info;

        const isEffectivelyCompleted =
            traceInfo.trace_state === 'complete' ||
            (traceInfo.trace_state === 'pending' && traceInfo.pending_messages === 0);

        return {
            status: isEffectivelyCompleted ? 'completed' : mapTraceState(traceInfo.trace_state),
            totalMessages: traceInfo.messages,
            pendingMessages: traceInfo.pending_messages,
            completedMessages: traceInfo.messages - traceInfo.pending_messages,
            actions: extractActions(trace.actions),
        };
    }

    // If neither pending nor completed trace found, the transaction
    // is likely still propagating to the network
    return {
        status: 'pending',
        totalMessages: 0,
        pendingMessages: 0,
        completedMessages: 0,
        actions: [],
    };
};
