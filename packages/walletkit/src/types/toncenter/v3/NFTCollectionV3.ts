import { NftCollection } from '../NftCollection';
import { asAddressFriendly, asMaybeAddressFriendly } from '../../primitive';
import { base64ToHash } from '../../../utils/base64';

export interface NFTCollectionV3 {
    address: string;
    code_hash?: string;
    collection_content?: { [key: string]: never };
    data_hash?: string;
    last_transaction_lt?: string;
    next_item_index: string;
    owner_address?: string;
}

export function toNftCollection(data: NFTCollectionV3): NftCollection {
    const out: NftCollection = {
        address: asAddressFriendly(data.address),
        codeHash: base64ToHash(data.code_hash),
        dataHash: base64ToHash(data.data_hash),
        nextItemIndex: BigInt(data.next_item_index),
        ownerAddress: asMaybeAddressFriendly(data.owner_address),
    };
    if (data.last_transaction_lt) out.lastTransactionLt = BigInt(data.last_transaction_lt);
    if (data.collection_content) out.collectionContent = data.collection_content;
    return out;
}
