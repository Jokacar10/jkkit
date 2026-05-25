/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessQuote } from '@ton/walletkit';

import type { TransactionRequestMessage } from '../../types/transaction';
import type { AppKit } from '../../core/app-kit';
import { getSelectedWallet } from '../wallets/get-selected-wallet';

export interface GetGaslessQuoteOptions {
    /** Master address of the jetton used to pay the relayer's fee */
    feeJettonMaster: string;
    /** User's messages to include in the gasless transaction */
    messages: TransactionRequestMessage[];
    /** Gasless provider id. Uses the default provider when omitted. */
    providerId?: string;
}

export type GetGaslessQuoteReturnType = Promise<GaslessQuote>;

export type GetGaslessQuoteErrorType = Error;

/**
 * Ask the relayer for a gasless transaction quote.
 *
 * Returns relayer-wrapped messages (ready to be signed via `signMessage`), the
 * fee charged in the fee jetton, and the bundle validity window (`validUntil`).
 *
 * The result is intended to be passed verbatim to `sendGaslessTransaction`,
 * which forwards the signed BoC to the relayer.
 */
export const getGaslessQuote = async (appKit: AppKit, options: GetGaslessQuoteOptions): GetGaslessQuoteReturnType => {
    const wallet = getSelectedWallet(appKit);

    if (!wallet) {
        throw new Error('Wallet not connected');
    }

    return appKit.gaslessManager.getQuote(
        {
            feeJettonMaster: options.feeJettonMaster,
            walletAddress: wallet.getAddress(),
            walletPublicKey: wallet.getPublicKey(),
            messages: options.messages,
        },
        options.providerId,
    );
};
