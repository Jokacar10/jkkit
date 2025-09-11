import { AddressFriendly, Hash } from '../primitive';
import type { NftCollection } from './NftCollection';

export interface NftItem {
    address: AddressFriendly;
    auctionContractAddress: AddressFriendly | null;
    codeHash: Hash | null;
    dataHash: Hash | null;
    collection: NftCollection | null;
    collectionAddress: AddressFriendly | null;
    content?: { [key: string]: never };
    index: bigint;
    init: boolean;
    lastTransactionLt?: bigint;
    onSale: boolean;
    ownerAddress: AddressFriendly | null;
    realOwner: AddressFriendly | null;
    saleContractAddress: AddressFriendly | null;
}
