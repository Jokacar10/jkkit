import type { NftItemV3 } from './NftItemV3';
import { AddressBookRowV3 } from './AddressBookRowV3';
import { AddressMetadataV3 } from './AddressMetadataV3';
import { NftItemsResponse } from '../NftItemsResponse';
import { toNftItem } from './NftItemV3';
import { asAddressFriendly } from '../../primitive';
import { toTokenInfo } from './TokenInfoV3';
import { Pagination } from '../Pagination';

export interface NftItemsResponseV3 {
    address_book?: { [key: string]: AddressBookRowV3 };
    metadata?: { [key: string]: AddressMetadataV3 };
    nft_items?: NftItemV3[];
}

export function toNftItemsResponse(data: NftItemsResponseV3, pagination: Pagination): NftItemsResponse {
    const out: NftItemsResponse = {
        addressBook: {},
        metadata: {},
        items: (data.nft_items ?? []).map(toNftItem),
        pagination,
    };
    if (out.items.length === 0) {
        out.pagination.pages = 0;
    }
    if (data.address_book) {
        for (const address of Object.keys(data.address_book)) {
            out.addressBook[asAddressFriendly(address)] = {
                domain: data.address_book[address].domain,
            };
        }
    }
    if (data.metadata) {
        for (const address of Object.keys(data.metadata)) {
            out.metadata[asAddressFriendly(address)] = {
                isIndexed: data.metadata[address].is_indexed,
                tokenInfo: (data.metadata[address].token_info ?? []).map(toTokenInfo),
            };
        }
    }
    return out;
}
