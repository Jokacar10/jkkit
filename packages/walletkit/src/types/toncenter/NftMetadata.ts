import { AddressFriendly } from '../primitive';
import { AddressMetadata } from './AddressMetadata';

export type NftMetadata = { [key: AddressFriendly]: AddressMetadata };
