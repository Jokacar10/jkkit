import { DAppInfo } from "../core/DAppInfo";
import { BridgeEvent } from "./BridgeEvent";

export interface ConnectionRequestEvent extends BridgeEvent {
    /**
     * Preview information for UI display
     */
    preview: ConnectionRequestEventPreview;
}

export interface ConnectionRequestEventPreview {
    /**
     * List of requested items from the dApp
     */
    requestedItems: ConnectionRequestEventPreviewRequestedItem[];

    /**
     * List of requested permissions from the dApp
     */
    permissions: ConnectionRequestEventPreviewPermission[];

    /**
     * Decentralized Application information
     */
    dAppInfo?: DAppInfo;
}

export interface ConnectionRequestEventPreviewRequestedItem {
    /**
     * Name of the requested item
     */
    name: string;

    /**
     * Description for the requested item
     */
    description?: string;
}

export interface ConnectionRequestEventPreviewPermission {
    /**
     * Name of the requested permission
     */
    name?: string;

    /**
     * Title for the requested permission
     */
    title?: string;

    /**
     * Description for the requested permission
     */
    description?: string;
}