import { AddressFriendly, Hash } from '../primitive';
import type { NftCollection } from './NftCollection';
import { TokenInfo } from './TokenInfo';

export interface NftItem {
    address: AddressFriendly;
    auctionContractAddress: AddressFriendly | null;
    codeHash: Hash | null;
    dataHash: Hash | null;
    collection: NftCollection | null;
    collectionAddress: AddressFriendly | null;
    content?: { [key: string]: never };
    metadata?: TokenInfo;
    index: bigint;
    init: boolean;
    lastTransactionLt?: bigint;
    onSale: boolean;
    ownerAddress: AddressFriendly | null;
    realOwner: AddressFriendly | null;
    saleContractAddress: AddressFriendly | null;
}
