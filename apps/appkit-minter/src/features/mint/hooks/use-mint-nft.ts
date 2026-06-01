/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import {
    useGaslessQuote,
    useJettonInfo,
    useSelectedWallet,
    useSendGaslessTransaction,
    useSendTransaction,
} from '@ton/appkit-react';
import { formatUnits } from '@ton/appkit';
import type { GaslessQuote } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import { useMintForwardMessage } from './use-mint-forward-message';
import { useNftMintTransaction } from './use-nft-mint-transaction';

export interface UseMintNftReturn {
    /** Trigger the mint — picks the right flow based on `gaslessEnabled` in store. */
    send: () => Promise<void>;
    /** True while either the gasless or the regular send mutation is in flight. */
    isSending: boolean;
    /** Latest send error from either flow. */
    error: Error | undefined;
    /** Wallet + card + (when gasless) quote are all ready. */
    canSend: boolean;

    gasless: {
        /** Derived from the store flag — convenience for UI gating. */
        enabled: boolean;
        /** Latest gasless quote; `undefined` while quoting or before inputs are ready. */
        quote: GaslessQuote | undefined;
        /** Quote refetch in progress. */
        isLoadingQuote: boolean;
        /** Formatted relayer commission, e.g. `"0.219 USDT"`. */
        fee: string | undefined;
        /** Quote-side error — kept distinct from send-side error for UI nuance. */
        quoteError: Error | undefined;
    };
}

/**
 * Single entry-point for the mint flow. Reads `gaslessEnabled` and
 * `gaslessFeeAsset` from `minter-store` and dispatches to either:
 *
 * - **Gasless**: builds the MintForward jetton-transfer via
 *   {@link useMintForwardMessage}, quotes it via {@link useGaslessQuote},
 *   sends through TonAPI via {@link useSendGaslessTransaction}.
 * - **Regular**: emits the raw NFT deploy via {@link useSendTransaction}.
 *
 * Common state lives on the top-level return shape (`send`, `isSending`,
 * `error`, `canSend`); gasless-only state hangs off the `gasless` block.
 */
export const useMintNft = (): UseMintNftReturn => {
    const [wallet] = useSelectedWallet();
    const gaslessEnabled = useMinterStore((state) => state.gaslessEnabled);
    const gaslessFeeAsset = useMinterStore((state) => state.gaslessFeeAsset);

    const { createMintTransaction, canMint } = useNftMintTransaction();

    // Gasless path
    const { message } = useMintForwardMessage();
    const {
        data: quote,
        isFetching: isLoadingQuote,
        error: quoteError,
    } = useGaslessQuote({
        messages: message ? [message] : [],
        feeAsset: gaslessFeeAsset ?? undefined,
        query: { enabled: gaslessEnabled && !!message },
    });

    const { data: feeAssetInfo } = useJettonInfo({
        address: gaslessFeeAsset ?? undefined,
        query: { enabled: gaslessEnabled && !!gaslessFeeAsset },
    });

    const fee =
        quote && feeAssetInfo?.decimals != null
            ? `${formatUnits(quote.fee, feeAssetInfo.decimals)} ${feeAssetInfo.symbol ?? ''}`.trim()
            : undefined;

    const {
        mutateAsync: sendGasless,
        isPending: isSendingGasless,
        error: gaslessSendError,
    } = useSendGaslessTransaction();

    // Regular path
    const { mutateAsync: sendRegular, isPending: isSendingRegular, error: regularSendError } = useSendTransaction();

    const isSending = isSendingGasless || isSendingRegular;
    const error = gaslessSendError ?? regularSendError ?? undefined;

    const canSendGasless = canMint && !!message && !!quote && !isLoadingQuote && !quoteError && !isSending;
    const canSendRegular = canMint && !isSending;
    const canSend = gaslessEnabled ? canSendGasless : canSendRegular;

    const send = useCallback(async (): Promise<void> => {
        if (!wallet) throw new Error('Wallet not connected');

        if (gaslessEnabled) {
            if (!quote) throw new Error('Gasless quote not ready');
            await sendGasless({ quote });
            return;
        }

        const request = await createMintTransaction();
        if (!request) throw new Error('Failed to build mint transaction');
        await sendRegular(request);
    }, [wallet, gaslessEnabled, quote, sendGasless, createMintTransaction, sendRegular]);

    return {
        send,
        isSending,
        error,
        canSend,
        gasless: {
            enabled: gaslessEnabled,
            quote: quote ?? undefined,
            isLoadingQuote,
            fee,
            quoteError: quoteError ?? undefined,
        },
    };
};
