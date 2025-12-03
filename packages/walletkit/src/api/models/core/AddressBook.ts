import { UserFriendlyAddress } from "./Primitives";

export type AddressBook = { [key: string]: AddressBookEntry };

export interface AddressBookEntry {
    /**
     * The human-readable representation of the blockchain address
     */
    userFriendly?: UserFriendlyAddress;

    /**
     * The domain name associated with the address if available
     */
    domain?: string;
}