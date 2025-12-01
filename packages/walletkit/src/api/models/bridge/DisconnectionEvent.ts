import { BridgeEvent } from './BridgeEvent';
import { DAppInfo } from '../core/DAppInfo';

export interface DisconnectionEvent extends BridgeEvent {
    /**
     * Preview information for UI display
     */
    preview: DisconnectionEventPreview;
}

export interface DisconnectionEventPreview {
    /**
     * Reason of disconnection.
     */
    reason?: string;

    /**
     * Decentralized Application information
     */
    dAppInfo?: DAppInfo;
}