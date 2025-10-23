import { fromNano } from '@ton/core';

import { EmulationAction, EmulationTonTransferDetails } from './emulation';
import { asAddressFriendly, Hex } from '../primitive';
import { Base64ToHex } from '../../utils/base64';

export interface Event {
    eventId: Hex;
    account: Account;
    timestamp: number;
    actions: Action[];
    isScam: boolean;
    lt: number;
    inProgress: boolean;
}

export interface TypedAction {
    type: string;
    id: Hex;
    status: string;
    simplePreview: SimplePreview;
    baseTransactions: Hex[];
}

export interface TonTransferAction extends TypedAction {
    type: 'TonTransfer';
    TonTransfer: TonTransfer;
}

export interface SmartContractExecAction extends TypedAction {
    type: 'SmartContractExec';
    SmartContractExec: SmartContractExec;
}

export interface SmartContractExec {
    executor: Account;
    contract: Account;
    tonAttached: number;
    operation: string;
    payload: string;
}

export interface JettonSwapAction extends TypedAction {
    type: 'JettonSwap';
    JettonSwap: JettonSwap;
}

export interface JettonSwap {
    dex: string;
    amountIn: string;
    amountOut: string;
    tonIn: number;
    userWallet: Account;
    router: Account;
    jettonMasterOut: JettonMasterOut;
}

export interface JettonMasterOut {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    image: string;
    verification: string;
    score: number;
}

export type Action = TypedAction | TonTransferAction | SmartContractExecAction | JettonSwapAction;

export function createAction(data: EmulationAction): Action {
    switch (data.type) {
        case 'ton_transfer':
            return createTonTransferAction(data);
        case 'jetton_mint': // TODO jetton_mint
        default:
            return createDefaultAction(data);
    }
}

export function createDefaultAction(data: EmulationAction): TypedAction {
    return {
        type: 'Unknown',
        id: Base64ToHex(data.action_id),
        status: data.success ? 'success' : 'failure',
        simplePreview: {
            name: 'Unknown',
            description: 'Transferring unknown',
            value: 'unknown',
            accounts: (data.accounts || []).map(toAccount),
        },
        baseTransactions: data.transactions.map(Base64ToHex),
    };
}

export function createTonTransferAction(data: EmulationAction): TonTransferAction {
    const details = data.details as EmulationTonTransferDetails;
    return {
        type: 'TonTransfer',
        id: Base64ToHex(data.action_id),
        status: data.success ? 'success' : 'failure',
        TonTransfer: {
            sender: toAccount(details.source),
            recipient: toAccount(details.destination),
            amount: BigInt(details.value),
            comment: details.comment ? details.comment : undefined,
        },
        simplePreview: {
            name: 'Ton Transfer',
            description: `Transferring ${fromNano(details.value)} TON`,
            value: `${fromNano(details.value)} TON`,
            accounts: (data.accounts || []).map(toAccount),
        },
        baseTransactions: data.transactions.map(Base64ToHex),
    };
}

export interface TonTransfer {
    sender: Account;
    recipient: Account;
    amount: bigint;
    comment?: string;
}

export interface SimplePreview {
    name: string;
    description: string;
    value: string;
    accounts: Account[];
}

export interface Account {
    address: string;
    name?: string;
    isScam: boolean;
    isWallet: boolean;
}

export function toAccount(address: string): Account {
    return {
        address: asAddressFriendly(address),
        // TODO implement name isScam for Account
        isScam: false, // TODO implement detect isScam for Account
        isWallet: true, // TODO implement detect isWallet for Account
    };
}
