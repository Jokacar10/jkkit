import { NftCollection } from './NftCollection';
import { AddressMetadata } from './AddressMetadata';
import { AddressBookRow } from './AddressBookRow';

export interface NftCollections {
    addressBook?: { [key: string]: AddressBookRow };
    metadata?: { [key: string]: AddressMetadata };
    nftCollections?: NftCollection[];
}
