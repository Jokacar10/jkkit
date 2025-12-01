import { SendMode } from "@ton/core";
import { ExtraCurrencies } from "../core/ExtraCurrencies";
import { Address, Base64String } from "../core/Primitives";
import { TokenAmount } from "../core/TokenAmount";

export interface TonsTransferRequest {
    address: Address;
    amount: TokenAmount;
    stateInit?: Base64String;
    extraCurrency?: ExtraCurrencies;
    mode?: SendMode;
    body?: Base64String;
    comment?: string;
}