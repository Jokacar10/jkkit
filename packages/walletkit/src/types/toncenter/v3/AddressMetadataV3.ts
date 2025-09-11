import { NftTokenInfoV3 } from './NftTokenInfoV3';

export interface AddressMetadataV3 {
    is_indexed: boolean;
    token_info: NftTokenInfoV3[];
}
