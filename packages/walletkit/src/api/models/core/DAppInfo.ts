
export interface DAppInfo {
    /**
     * The name of the decentralized application (DApp).
     */
    name?: string;
    
    /**
     * A brief description of the DApp.
     */
    description?: string;

    /**
     * The URL of the DApp.
     * @format url
     */
    url?: string;

    /**
     * The icon URL of the DApp.
     * @format url
     */
    iconUrl?: string;

    /**
     * The manifest URL of the DApp.
     * @format url
     */
    manifestUrl?: string;
}
