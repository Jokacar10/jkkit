import { DAppInfo } from '../core/DAppInfo';
import { UserFriendlyAddress } from '../core/Primitives';

export type BridgeEvent = {
    /**
     * Unique identifier for the bridge event.
     */
    id?: string;

    from?: string;

    /**
     * The wallet address associated with the event.
     */
    walletAddress?: UserFriendlyAddress;

    /**
     * The domain associated with the event.
     */
    domain?: string;

    isJsBridge?: boolean;
    tabId?: number;
    sessionId?: string;
    isLocal?: boolean;
    messageId?: string;
    traceId?: string;
};