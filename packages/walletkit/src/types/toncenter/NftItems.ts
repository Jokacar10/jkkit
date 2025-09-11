import type { NftItem } from './NftItem';
import { AddressBookRow } from './AddressBookRow';
import { AddressMetadata } from './AddressMetadata';
import { AddressFriendly } from '../primitive';
export interface NftItems {
    addressBook: { [key: AddressFriendly]: AddressBookRow };
    metadata: { [key: AddressFriendly]: AddressMetadata };
    nftItems: NftItem[];
}
