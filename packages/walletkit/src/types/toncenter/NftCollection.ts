import { AddressFriendly, Hash } from '../primitive';

export interface NftCollection {
    address: AddressFriendly;
    codeHash: Hash | null;
    collectionContent?: { [key: string]: never };
    dataHash: Hash | null;
    lastTransactionLt?: bigint;
    nextItemIndex: bigint;
    ownerAddress: AddressFriendly | null;
}
