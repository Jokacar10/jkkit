/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessQuote } from '../../gasless';
import type { UserFriendlyAddress } from '../../types/primitives';
import type { AppKit } from '../../core/app-kit';
import { createTransferTonTransaction } from '../transaction/create-transfer-ton-transaction';
import { getGaslessQuote } from './get-gasless-quote';

export interface GetGaslessTonTransferQuoteOptions {
    /** Recipient address */
    recipientAddress: string;
    /** Human-readable amount of TON to transfer */
    amount: string;
    /** Human-readable text comment (converted to payload) */
    comment?: string;
    /** Message payload encoded in Base64 (overrides comment if provided) */
    payload?: string;
    /** Initial state for deploying a new contract, encoded in Base64 */
    stateInit?: string;
    /**
     * Asset address used to pay the relayer's fee (jetton master for TonAPI).
     * Omit only for free / sponsored providers — see {@link getGaslessQuote}.
     */
    feeAsset?: UserFriendlyAddress;
    /** Gasless provider id. Uses the default provider when omitted. */
    providerId?: string;
}

export type GetGaslessTonTransferQuoteReturnType = Promise<GaslessQuote>;

export type GetGaslessTonTransferQuoteErrorType = Error;

/**
 * Build a gasless quote for a TON transfer.
 *
 * Convenience wrapper that assembles the transfer message the same way as
 * {@link createTransferTonTransaction} and forwards it to {@link getGaslessQuote}.
 * The result is passed verbatim to `sendGaslessTransaction`, preserving the
 * quote → send two-step flow.
 *
 * The quote is always bound to the selected wallet's network (the message is
 * built for that wallet), so there is no `network` override.
 */
export const getGaslessTonTransferQuote = async (
    appKit: AppKit,
    options: GetGaslessTonTransferQuoteOptions,
): GetGaslessTonTransferQuoteReturnType => {
    const { recipientAddress, amount, comment, payload, stateInit, feeAsset, providerId } = options;

    const { messages } = createTransferTonTransaction(appKit, {
        recipientAddress,
        amount,
        comment,
        payload,
        stateInit,
    });

    return getGaslessQuote(appKit, { messages, feeAsset, providerId });
};
