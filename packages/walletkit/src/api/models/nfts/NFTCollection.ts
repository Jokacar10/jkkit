import { TokenImage } from "../core/TokenImage";
import { Address, Hex } from "../core/primitives";

export interface NFTCollection {
    address: Address;
    name?: string;
    image?: TokenImage;
    description?: string;
    /**
     * Index of the next item in the collection
     * @format bigInt
     */
    nextItemIndex?: string;
    codeHash?: Hex;
    dataHash?: Hex;
    ownerAddress?: Address;
    metadata?: { [key: string]: string };
    extra?: { [key: string]: unknown };
}