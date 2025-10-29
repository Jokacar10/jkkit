import { fromNano } from '@ton/core';

import { AddressBook, toAccount, TonTransferAction, StatusAction } from '../AccountEvent';
import { EmulationMessage, ToncenterTransaction } from '../emulation';
import { Base64ToHex } from '../../../utils/base64';

export function parseOutgoingTonTransfers(
    tx: ToncenterTransaction,
    addressBook: AddressBook,
    status: StatusAction,
): TonTransferAction[] {
    const actions: TonTransferAction[] = [];
    for (const msg of tx.out_msgs || []) {
        const valueNum = toPositiveNumber(msg.value);
        if (valueNum === null) {
            continue;
        }
        const sender = msg.source ?? tx.account;
        const recipient = msg.destination;
        const amount = BigInt(valueNum);

        actions.push({
            type: 'TonTransfer',
            id: Base64ToHex(tx.hash),
            status,
            TonTransfer: {
                sender: toAccount(sender, addressBook),
                recipient: toAccount(recipient, addressBook),
                amount,
                comment: extractComment(msg) ?? undefined,
            },
            simplePreview: {
                name: 'Ton Transfer',
                description: `Transferring ${fromNano(String(amount))} TON`,
                value: `${fromNano(String(amount))} TON`,
                accounts: [toAccount(sender, addressBook), toAccount(recipient, addressBook)],
            },
            baseTransactions: [Base64ToHex(tx.hash)],
        });
    }
    return actions;
}

export function parseIncomingTonTransfers(
    tx: ToncenterTransaction,
    addressBook: AddressBook,
    status: StatusAction,
): TonTransferAction[] {
    const actions: TonTransferAction[] = [];
    const msg = tx.in_msg;
    if (!msg) {
        return actions;
    }
    const valueNum = toPositiveNumber(msg.value);
    if (valueNum === null) {
        return actions;
    }
    const sender = msg.source ?? tx.account;
    const recipient = msg.destination;
    const amount = BigInt(valueNum);

    actions.push({
        type: 'TonTransfer',
        id: Base64ToHex(tx.hash),
        status,
        TonTransfer: {
            sender: toAccount(sender, addressBook),
            recipient: toAccount(recipient, addressBook),
            amount,
            comment: extractComment(msg) ?? undefined,
        },
        simplePreview: {
            name: 'Ton Transfer',
            description: `Transferring ${fromNano(String(amount))} TON`,
            value: `${fromNano(String(amount))} TON`,
            accounts: [toAccount(sender, addressBook), toAccount(recipient, addressBook)],
        },
        baseTransactions: [Base64ToHex(tx.hash)],
    });
    return actions;
}

export function computeStatus(tx: ToncenterTransaction): StatusAction {
    const aborted = Boolean(tx.description?.aborted);
    const computeSuccess = Boolean(tx.description?.compute_ph?.success);
    const actionSuccess = Boolean(tx.description?.action?.success);
    return !aborted && computeSuccess && actionSuccess ? 'success' : 'failure';
}

function toPositiveNumber(value: string | null): number | null {
    if (value === null || value === undefined) {
        return null;
    }
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
        return null;
    }
    return n;
}

function extractComment(msg: EmulationMessage): string | null {
    type DecodedComment = { '@type'?: string; comment?: string; text?: string } | null | undefined;
    const decoded: DecodedComment = (msg.message_content &&
        (msg.message_content as { decoded?: unknown }).decoded) as DecodedComment;
    if (decoded && typeof decoded === 'object') {
        if (typeof decoded.comment === 'string' && decoded.comment.length > 0) {
            return decoded.comment;
        }
        if (decoded['@type'] === 'text_comment' && typeof decoded.text === 'string' && decoded.text.length > 0) {
            return decoded.text;
        }
    }
    return null;
}
