import { ExtraCurrencies } from "../core/ExtraCurrencies";
import { Network } from "../core/Network";
import { 
    Address, 
    Base64String, 
} from "../core/Primitives";
import { SendMode } from "../core/SendMode";
import { TokenAmount } from "../core/TokenAmount";

export interface TransactionMessage {
    address: Address;
    amount: TokenAmount;
    payload?: Base64String;
    stateInit?: Base64String;
    extraCurrency?: ExtraCurrencies;
    mode?: SendMode;
}

export interface TransactionRequest {
    messages: TransactionMessage[];
    network?: Network;
    validUntil?: number;
    from?: Address;
}
