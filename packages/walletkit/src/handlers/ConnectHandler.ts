// Connect request handler

import type { WalletInterface, EventConnectRequest } from '../types';
import type { RawBridgeEvent, RequestContext, EventHandler, RawBridgeEventConnect } from '../types/internal';
import { sanitizeString } from '../validation/sanitization';

export class ConnectHandler implements EventHandler<EventConnectRequest> {
    canHandle(event: RawBridgeEvent): boolean {
        return event.method === 'startConnect';
    }

    async handle(event: RawBridgeEventConnect, context: RequestContext): Promise<EventConnectRequest> {
        // Extract manifest information
        const manifestUrl = this.extractManifestUrl(event);
        let manifest = null;

        // Try to fetch manifest if URL is available
        if (manifestUrl) {
            try {
                manifest = await this.fetchManifest(manifestUrl);
            } catch (error) {
                console.warn('Failed to fetch manifest:', error);
            }
        }

        const connectEvent: EventConnectRequest = {
            id: event.id,
            dAppName: this.extractDAppName(event, manifest),
            dAppUrl: manifest?.url || '',
            manifestUrl,
            request: event.params?.items || [],
            preview: this.createPreview(event, manifest),
            wallet: context.wallet, // Don't assign a wallet yet - user will select one
        };

        return connectEvent;
    }

    /**
     * Extract dApp name from bridge event or manifest
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private extractDAppName(event: RawBridgeEvent, manifest?: any): string {
        const name =
            manifest?.name ||
            event.params?.manifest?.name ||
            // event.params?.dAppName ||
            // event.params?.name ||
            'Unknown dApp';

        return sanitizeString(name);
    }

    /**
     * Extract manifest URL from bridge event
     */
    private extractManifestUrl(event: RawBridgeEventConnect): string {
        const url = event.params?.manifest?.url || '';

        return sanitizeString(url);
    }

    /**
     * Create preview object for connect request
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private createPreview(event: RawBridgeEventConnect, fetchedManifest?: any): any {
        const eventManifest = event.params?.manifest;
        const manifest = fetchedManifest || eventManifest;

        const sanitizedManifest = manifest && {
            name: sanitizeString(manifest.name || ''),
            description: sanitizeString(manifest.description || ''),
            url: sanitizeString(manifest.url || ''),
            iconUrl: sanitizeString(manifest.iconUrl || ''),
        };

        return {
            manifest: manifest ? sanitizedManifest : null,
            requestedItems: event.params?.items || [],
            // permissions: event.params?.permissions || [],
        };
    }

    /**
     * Fetch manifest from URL
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async fetchManifest(manifestUrl: string): Promise<any> {
        const response = await fetch(manifestUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch manifest: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Create placeholder wallet when no wallet is in context
     */
    private createPlaceholderWallet(): WalletInterface {
        return {
            publicKey: new Uint8Array(0),
            version: '',
            sign: async () => new Uint8Array(0),
            getAddress: () => '',
            getBalance: async () => BigInt(0),
            getStateInit: async () => '',
        };
    }
}
