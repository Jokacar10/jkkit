import { AddressBookRow } from './AddressBookRow';
import { AddressFriendly } from '../primitive';
import { NftItems } from './NftItems';
import { NftMetadata } from './NftMetadata';

export interface NftItemsResponse extends NftItems {
    addressBook: { [key: AddressFriendly]: AddressBookRow };
    metadata: NftMetadata;
}
