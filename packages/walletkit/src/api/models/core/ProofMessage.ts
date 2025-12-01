import { 
    Address, 
    Base64String, 
    Hex 
} from "../core/Primitives";

export interface ProofMessage {
    /**
     * @format int
     */
    workchain: number;
    address: Address;
    timestamp: number;
    domain?: ProofMessageDomain;
    payload: string;
    stateInit: Base64String;
    signature?: Hex;
}

interface ProofMessageDomain {
    /**
     * @format uint32
     */
    lengthBytes: number;
    value: string;
}