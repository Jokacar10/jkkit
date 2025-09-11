import { storeNftTransferMessage } from '@ton-community/assets-sdk';
import { Address, beginCell, SendMode } from '@ton/core';

import { WalletInterface } from '../../../types';
import { WalletNftInterface } from '../../../types/wallet';
import { validateTransactionMessage } from '../../../validation';
import { NftTransferParamsHuman, NftTransferParamsNative } from '../../../types/nfts';
import { ConnectTransactionParamContent, ConnectTransactionParamMessage } from '../../../types/internal';
import { NftItems } from '../../../types/toncenter/NftItems';
import { LimitRequest } from '../../ApiClientToncenter';
import type { NftItem } from '../../../types/toncenter/NftItem';

export class WalletNftClass implements WalletNftInterface {
    getNfts(this: WalletInterface, params: LimitRequest): Promise<NftItems> {
        return this.client.nftItems({
            ownerAddress: [this.getAddress()],
            offset: params.offset ?? 0,
            limit: params.limit ?? 100,
        });
    }

    async getNft(this: WalletInterface, address: Address | string): Promise<NftItem | null> {
        const result = await this.client.nftItems({
            address: [address],
            ownerAddress: [this.getAddress()],
        });
        if (result.nftItems.length > 0) {
            return result.nftItems[0];
        }
        return null;
    }

    async createSendNft(
        this: WalletInterface,
        nftTransferMessage: NftTransferParamsHuman,
    ): Promise<ConnectTransactionParamContent> {
        const forwardPayload = nftTransferMessage.comment
            ? beginCell().storeUint(0, 32).storeStringTail(nftTransferMessage.comment).endCell()
            : null;
        const nftPayload = beginCell()
            .store(
                storeNftTransferMessage({
                    customPayload: null,
                    forwardAmount: 1n,
                    forwardPayload: forwardPayload,
                    newOwner: Address.parse(nftTransferMessage.toAddress),
                    queryId: 0n,
                    responseDestination: Address.parse(this.getAddress()),
                }),
            )
            .endCell();
        const message: ConnectTransactionParamMessage = {
            address: nftTransferMessage.nftAddress,
            amount: nftTransferMessage.transferAmount.toString(),
            payload: nftPayload.toBoc().toString('base64'),
            stateInit: undefined,
            extraCurrency: undefined,
            mode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
        };

        if (!validateTransactionMessage(message, false).isValid) {
            throw new Error(`Invalid transaction message: ${JSON.stringify(message)}`);
        }

        return {
            messages: [message],
            from: this.getAddress(),
        };
    }

    async createSendNftNative(
        this: WalletInterface,
        params: NftTransferParamsNative,
    ): Promise<ConnectTransactionParamContent> {
        const nftPayload = beginCell().store(storeNftTransferMessage(params.transferMessage)).endCell();
        const message: ConnectTransactionParamMessage = {
            address: params.nftAddress,
            amount: params.transferAmount.toString(),
            payload: nftPayload.toBoc().toString('base64'),
            stateInit: undefined,
            extraCurrency: undefined,
            mode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
        };

        if (!validateTransactionMessage(message, false).isValid) {
            throw new Error(`Invalid transaction message: ${JSON.stringify(message)}`);
        }

        return {
            messages: [message],
            from: this.getAddress(),
        };
    }
}
