import { UserFriendlyAddress } from "../core/primitives";
import { TokenAmount } from "../core/TokenAmount";

export interface JettonsTransferRequest {
    /**
     * Jetton contract address
     */
    jettonAddress: UserFriendlyAddress;

    /**
     * Amount to transfer in jeton's smallest unit
     */
    transferAmount?: TokenAmount;

    /**
     * Recipient address
     */
    recipientAddress: UserFriendlyAddress;

    /**
     * Optional comment for the transfer
     */
    comment?: string;
}