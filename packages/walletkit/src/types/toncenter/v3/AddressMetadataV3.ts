import { TokenInfoV3 } from './TokenInfoV3';

export interface AddressMetadataV3 {
    is_indexed: boolean;
    token_info: TokenInfoV3[];
}
