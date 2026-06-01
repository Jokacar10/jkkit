/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react';
import { Address, beginCell, Cell } from '@ton/core';
import { useGaslessConfig, useJettonWalletAddress, useSelectedWallet } from '@ton/appkit-react';
import { asBase64 } from '@ton/appkit';
import type { Base64String, TransactionRequestMessage } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import {
    FORWARD_TON_AMOUNT,
    JETTON_GAS_BUDGET,
    JETTON_TRANSFER_OP,
    MINT_FORWARD_ADDRESS,
    USDT_FORWARD_JETTON_AMOUNT,
} from '../constants';
import { useNftMintTransaction } from './use-nft-mint-transaction';

export interface UseMintForwardMessageReturn {
    /** Single TEP-74 jetton-transfer message ready to be quoted via TonAPI gasless. */
    message: TransactionRequestMessage | undefined;
    /** All inputs (card, wallet, relayer config, fee-asset, jetton-wallet) are resolved. */
    isReady: boolean;
}

/**
 * Builds the user-signed gasless mint message: a TEP-74 jetton transfer of the
 * selected fee-asset to `MintForward`, with the NFT deploy spec (address, body,
 * stateInit, amount) packed into `forward_payload`. The contract unwraps it on
 * receipt and emits the NFT deploy itself — so the relayer never sees a
 * top-level `stateInit` in the user-signed batch.
 *
 * The hook is dormant until card + wallet + relayer config + fee-asset are all
 * present. Returns `undefined` for `message` in that case, leaving consumers
 * (e.g. `useGaslessQuote({ query: { enabled: !!message } })`) cleanly gated.
 */
export const useMintForwardMessage = (): UseMintForwardMessageReturn => {
    const [wallet] = useSelectedWallet();
    const gaslessFeeAsset = useMinterStore((state) => state.gaslessFeeAsset);
    const { createMintTransaction, canMint } = useNftMintTransaction();

    const { data: gaslessConfig } = useGaslessConfig();
    const relayAddress = gaslessConfig?.relayAddress;

    const { data: usdtWalletAddress } = useJettonWalletAddress({
        jettonAddress: gaslessFeeAsset ?? undefined,
        ownerAddress: wallet?.getAddress() ?? undefined,
        query: { enabled: !!gaslessFeeAsset && !!wallet },
    });

    const [message, setMessage] = useState<TransactionRequestMessage | undefined>(undefined);

    useEffect(() => {
        if (!canMint || !wallet || !usdtWalletAddress || !relayAddress) {
            setMessage(undefined);
            return;
        }

        let cancelled = false;
        createMintTransaction()
            .then((req) => {
                const nftMsg = req.messages[0];
                if (!nftMsg.stateInit) throw new Error('mint message has no stateInit');

                const nftAddress = Address.parse(nftMsg.address);
                const nftStateInit = Cell.fromBase64(nftMsg.stateInit);
                const nftAmount = BigInt(nftMsg.amount);
                const emptyBody = beginCell().endCell();

                // forward_payload per MintForward.tolk:
                //   address(toAddress), ref(body), ref(stateInit), coins(amount)
                const forwardPayload = beginCell()
                    .storeAddress(nftAddress)
                    .storeRef(emptyBody)
                    .storeRef(nftStateInit)
                    .storeCoins(nftAmount)
                    .endCell();

                // TEP-74 jetton transfer body. `response_destination = relayer`
                // mirrors the standard gasless pattern — relayer pays compute,
                // captures the jetton-wallet TON excess.
                const transferBody = beginCell()
                    .storeUint(JETTON_TRANSFER_OP, 32)
                    .storeUint(0, 64) // query_id
                    .storeCoins(USDT_FORWARD_JETTON_AMOUNT)
                    .storeAddress(Address.parse(MINT_FORWARD_ADDRESS))
                    .storeAddress(Address.parse(relayAddress))
                    .storeBit(0) // custom_payload: none
                    .storeCoins(FORWARD_TON_AMOUNT)
                    .storeBit(1) // forward_payload: ref
                    .storeRef(forwardPayload)
                    .endCell();

                if (cancelled) return;
                setMessage({
                    address: usdtWalletAddress,
                    amount: JETTON_GAS_BUDGET.toString(),
                    payload: asBase64(transferBody.toBoc().toString('base64')) as Base64String,
                });
            })
            .catch(() => {
                if (cancelled) return;
                // Build failures are surfaced indirectly: `message` stays undefined,
                // which keeps the gasless flow gated until inputs become valid again.
                setMessage(undefined);
            });

        return () => {
            cancelled = true;
        };
    }, [canMint, createMintTransaction, relayAddress, usdtWalletAddress, wallet]);

    return { message, isReady: !!message };
};
