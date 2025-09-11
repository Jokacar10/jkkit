import { TokenInfo } from '../TokenInfo';

export interface TokenInfoV3 {
    description?: string;
    extra?: { [key: string]: never };
    image?: string;
    name?: string;
    nft_index?: string;
    symbol?: string;
    type?: string;
    valid?: boolean;
}

export function toTokenInfo(data: TokenInfoV3): TokenInfo {
    return {
        valid: data.valid,
        type: data.type,
        name: data.name,
        description: data.description,
        image: data.image,
        extra: data.extra,
    };
}
