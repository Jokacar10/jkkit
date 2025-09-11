import type { NftItem } from './NftItem';
import { Pagination } from './Pagination';

export interface NftItems {
    items: NftItem[];
    pagination: Pagination;
}
