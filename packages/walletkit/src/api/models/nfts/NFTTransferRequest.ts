import { UserFriendlyAddress } from "../core/primitives";
import { TokenAmount } from "../core/TokenAmount";

export interface NFTTransferRequest {
    /**
     * NFT contract address
     */
    nftAddress: UserFriendlyAddress;

    /**
     * Amount to transfer in nanotons, default is "100000000" (0.1 TON)
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