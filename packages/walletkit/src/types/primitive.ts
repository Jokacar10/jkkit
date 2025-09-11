import { Address } from '@ton/core';

declare const hashBrand: unique symbol;

export type Hash = `0x${string}` & { readonly [hashBrand]: never };

export function asHash(data: string): Hash {
    if (!/^0x[0-9a-fA-F]{64}$/.test(data)) {
        throw new Error('Not a valid 32-byte hash');
    }
    return data as Hash;
}

export type AddressFriendly = string;

export function asMaybeAddressFriendly(data?: string | null): AddressFriendly | null {
    try {
        return asAddressFriendly(data);
    } catch {
        /* empty */
    }
    return null;
}

export function asAddressFriendly(data?: string | null): AddressFriendly {
    try {
        if (data) return Address.parse(data).toString();
    } catch {
        /* empty */
    }
    throw new Error(`Can not convert to AddressFriendly from "${data}"`);
}
