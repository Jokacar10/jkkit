import { AddressFriendly, Hex } from '../primitive';

export interface NftCollection {
    address: AddressFriendly;
    codeHash: Hex | null;
    collectionContent?: { [key: string]: never };
    dataHash: Hex | null;
    lastTransactionLt?: bigint;
    nextItemIndex: bigint;
    ownerAddress: AddressFriendly | null;
}
