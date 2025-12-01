import { SignDataPayload } from "./SignDataPayload";
import { Address, Hex } from "../core/Primitives";

export interface PreparedSignData {
    address: Address;
    timestamp: number;
    domain: string;
    payload: SignDataPayload;
    hash: Hex;
}