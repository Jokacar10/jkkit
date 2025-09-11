import { AddressBookRow } from './AddressBookRow';
import { AddressMetadata } from './AddressMetadata';
import { AddressFriendly } from '../primitive';
import { NftItems } from './NftItems';

export interface NftItemsResponse extends NftItems {
    addressBook: { [key: AddressFriendly]: AddressBookRow };
    metadata: { [key: AddressFriendly]: AddressMetadata };
}
