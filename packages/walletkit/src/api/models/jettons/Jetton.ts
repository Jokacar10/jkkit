import { Address } from "../core/Primitives";
import { TokenAmount } from "../core/TokenAmount";
import { TokenInfo } from "../core/TokenInfo";

export interface Jetton {
    address: Address;
    walletAddress?: Address;
    masterAddress?: Address;
    balance?: TokenAmount;
    info?: TokenInfo;
    decimalsCount?: number;
    verification?: JettonVerification;
    metadata?: { [key: string]: string };
    extra?: { [key: string]: unknown };
}

export interface JettonVerification {
    verified?: boolean;
    source?: JettonVerificationSource;
    warnings?: string[];
}

// Check source of jetton verification in some wallet JSON using toncenter api
export declare enum JettonVerificationSource {
    toncenter = 'toncenter',
    community = 'community',
    manual = 'manual',
}