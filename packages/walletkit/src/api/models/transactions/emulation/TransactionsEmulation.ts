import { AddressBookEntry } from "../../core/AddressBookEntry";
import { Base64String } from "../../core/Primitives";

import { 
    TransactionEmulation, 
    TransactionEmulationTraceNode, 
    TransactionEmulationAction, 
    TransactionEmulationAddressMetadata 
} from "./TransactionEmulation";

export interface TransactionsEmulation {
    /**
     * Masterchain block sequence number where emulation was performed  
     * @format int
     */
    mcBlockSeqno: number;
    trace: TransactionEmulationTraceNode;
    transactions: { [key: string]: TransactionEmulation };
    actions: TransactionEmulationAction[];
    codeCells: { [key: string]: Base64String }; // base64-encoded cells by code hash
    dataCells: { [key: string]: Base64String }; // base64-encoded cells by data hash
    addressBook: { [key: string]: AddressBookEntry };
    metadata: { [key: string]: TransactionEmulationAddressMetadata };
    randSeed: string;
    isIncomplete: boolean;
}