/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Bridge injection for Android internal browser
import { Buffer } from 'buffer';

import { injectBridgeCode } from '@ton/walletkit/bridge';
import type { InjectedToExtensionBridgeRequestPayload } from '@ton/walletkit';

import { logError } from './utils/logger';

type DeviceFeature = string | { name: string; maxMessages?: number; types?: string[] };

type WalletPlatform = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'chrome' | 'firefox' | 'safari';

interface WalletInfoPayload {
    name: string;
    app_name: string;
    about_url: string;
    image: string;
    platforms: WalletPlatform[];
    jsBridgeKey: string;
    injected: boolean;
    embedded: boolean;
    tondns: string;
    bridgeUrl: string;
    features: DeviceFeature[];
}

type TonConnectBridge = {
    __notifyResponse?: (messageId: string) => void;
    __notifyEvent?: () => void;
    pullResponse?: (messageId: string) => string | null;
    pullEvent?: (frameId: string) => string | null;
    hasEvent?: (frameId: string) => boolean;
    postMessage?: (payload: string) => void;
};

type TonConnectWindow = Window & {
    Buffer?: typeof Buffer;
    __tonconnect_frameId?: string;
    AndroidTonConnect?: TonConnectBridge;
    tonkeeper?: {
        tonconnect?: {
            isWalletBrowser?: boolean;
        };
    };
};

// Import Transport type - it's available as internal export
interface Transport {
    send(request: Omit<InjectedToExtensionBridgeRequestPayload, 'id'>): Promise<unknown>;
    onEvent(callback: (event: unknown) => void): void;
    isAvailable(): boolean;
    requestContentScriptInjection?(): void;
    destroy(): void;
}

const tonWindow = window as TonConnectWindow;
tonWindow.Buffer = Buffer;
globalThis.Buffer = Buffer;

// Generate unique frame ID
const frameId =
    tonWindow.__tonconnect_frameId ||
    (tonWindow.__tonconnect_frameId =
        window === window.top ? 'main' : `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

const isAndroidWebView = typeof tonWindow.AndroidTonConnect !== 'undefined';

// Device info matching demo wallet extension format
const deviceInfo: {
    platform: 'android';
    appName: string;
    appVersion: string;
    maxProtocolVersion: number;
    features: DeviceFeature[];
} = {
    platform: 'android',
    appName: 'Tonkeeper',
    appVersion: '1.0.0',
    maxProtocolVersion: 2,
    features: [
        'SendTransaction',
        {
            name: 'SendTransaction',
            maxMessages: 4,
        },
        {
            name: 'SignData',
            types: ['text', 'binary', 'cell'],
        },
    ],
};

// Wallet info matching demo wallet extension format
// NOTE: TonConnect SDK expects snake_case properties (app_name, about_url, image)
// even though the TypeScript types use camelCase
const walletInfo: WalletInfoPayload = {
    name: 'tonkeeper', // key for wallet
    app_name: 'Tonkeeper', // SDK expects app_name not appName
    about_url: 'https://tonkeeper.com', // SDK expects about_url not aboutUrl
    image: 'https://tonkeeper.com/assets/tonconnect-icon.png', // SDK expects image not imageUrl
    platforms: ['ios', 'android', 'macos', 'windows', 'linux', 'chrome', 'firefox', 'safari'], // supported platforms
    jsBridgeKey: 'tonkeeper', // window key for wallet bridge
    injected: true, // wallet is injected into the page (via injectBridgeCode)
    embedded: true, // dApp IS embedded in wallet (wallet's internal browser) - tells dApp to prefer injected bridge
    tondns: 'tonkeeper.ton', // tondns for wallet
    bridgeUrl: 'https://bridge.tonapi.io/bridge', // url for wallet bridge
    features: [
        'SendTransaction',
        {
            name: 'SendTransaction',
            maxMessages: 4,
        },
        {
            name: 'SignData',
            types: ['text', 'binary', 'cell'],
        },
    ],
};

/**
 * Android WebView Transport Implementation
 * Uses BridgeInterface as message bus with postMessage for iframe communication
 */
class AndroidWebViewTransport implements Transport {
    private pendingRequests = new Map<
        string,
        { resolve: (value: unknown) => void; reject: (error: Error) => void; timeout: ReturnType<typeof setTimeout> }
    >();
    private eventCallbacks: Array<(event: unknown) => void> = [];

    constructor() {
        // Set up notification handlers and postMessage relay
        this.setupNotificationHandlers();
        this.setupPostMessageRelay();
    }

    private setupNotificationHandlers(): void {
        const bridge = tonWindow.AndroidTonConnect;
        if (!bridge) return;

        // Main frame: Pull from BridgeInterface and broadcast to iframes
        if (window === window.top) {
            bridge.__notifyResponse = (messageId: string) => {
                this.handleResponseNotification(messageId);
            };

            bridge.__notifyEvent = () => {
                this.handleEventNotification();
            };
        }
    }

    private setupPostMessageRelay(): void {
        window.addEventListener('message', (event) => {
            if (event.source === window) return;

            if (event.data?.type === 'ANDROID_BRIDGE_RESPONSE') {
                this.pullAndDeliverResponse(event.data.messageId);
                document.querySelectorAll('iframe').forEach((iframe) => {
                    try {
                        iframe.contentWindow?.postMessage(event.data, '*');
                    } catch (_e) {
                        // Ignore cross-origin errors
                    }
                });
            } else if (event.data?.type === 'ANDROID_BRIDGE_EVENT') {
                this.pullAndDeliverEvent();
                document.querySelectorAll('iframe').forEach((iframe) => {
                    try {
                        iframe.contentWindow?.postMessage(event.data, '*');
                    } catch (_e) {
                        // Ignore cross-origin errors
                    }
                });
            }
        });
    }

    private handleResponseNotification(messageId: string): void {
        this.pullAndDeliverResponse(messageId);
        document.querySelectorAll('iframe').forEach((iframe) => {
            try {
                iframe.contentWindow?.postMessage({ type: 'ANDROID_BRIDGE_RESPONSE', messageId }, '*');
            } catch (_e) {
                // Ignore cross-origin errors
            }
        });
    }

    private handleEventNotification(): void {
        this.pullAndDeliverEvent();
        document.querySelectorAll('iframe').forEach((iframe) => {
            try {
                iframe.contentWindow?.postMessage({ type: 'ANDROID_BRIDGE_EVENT' }, '*');
            } catch (_e) {
                // Ignore cross-origin errors
            }
        });
    }

    private pullAndDeliverResponse(messageId: string): void {
        const pending = this.pendingRequests.get(messageId);
        if (!pending) return;

        try {
            const bridge = tonWindow.AndroidTonConnect;
            if (!bridge?.pullResponse) return;

            const responseStr = bridge.pullResponse(messageId);
            if (responseStr) {
                const response = JSON.parse(responseStr);
                clearTimeout(pending.timeout);
                this.pendingRequests.delete(messageId);

                if (response.error) {
                    pending.reject(new Error(response.error.message || 'Failed'));
                } else {
                    pending.resolve(response.payload);
                }
            }
        } catch (error) {
            logError('[AndroidTransport] Failed to pull/process response:', error);
            pending.reject(error as Error);
        }
    }

    private pullAndDeliverEvent(): void {
        try {
            const bridge = tonWindow.AndroidTonConnect;
            if (!bridge?.pullEvent || !bridge?.hasEvent) return;

            while (bridge.hasEvent(frameId)) {
                const eventStr = bridge.pullEvent(frameId);
                if (eventStr) {
                    const data = JSON.parse(eventStr) as { type?: string; event?: unknown };
                    if (data.type === 'TONCONNECT_BRIDGE_EVENT' && data.event) {
                        this.eventCallbacks.forEach((callback) => {
                            try {
                                callback(data.event);
                            } catch (error) {
                                logError('[AndroidTransport] Event callback error:', error);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            logError('[AndroidTransport] Failed to pull/process event:', error);
        }
    }

    async send(request: Omit<InjectedToExtensionBridgeRequestPayload, 'id'>): Promise<unknown> {
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const bridge = tonWindow.AndroidTonConnect;
        if (!bridge?.postMessage) {
            throw new Error('AndroidTonConnect postMessage is not available');
        }

        bridge.postMessage(
            JSON.stringify({
                type: 'TONCONNECT_BRIDGE_REQUEST',
                messageId,
                method: request.method || 'unknown',
                params: request.params || {},
                frameId,
            }),
        );

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(messageId);
                reject(new Error('Request timeout'));
            }, 30000);

            this.pendingRequests.set(messageId, { resolve, reject, timeout });
        });
    }

    onEvent(callback: (event: unknown) => void): void {
        this.eventCallbacks.push(callback);
    }

    isAvailable(): boolean {
        return isAndroidWebView;
    }

    requestContentScriptInjection(): void {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
            try {
                const iframeWindow = iframe.contentWindow as TonConnectWindow;
                if (iframeWindow && !iframeWindow.tonkeeper?.tonconnect) {
                    injectBridgeCode(
                        iframeWindow,
                        {
                            deviceInfo,
                            walletInfo,
                            isWalletBrowser: true,
                        },
                        new AndroidWebViewTransport(),
                    );
                }
            } catch (_e) {
                // Cross-origin iframe - will use postMessage bridge
            }
        });
    }

    destroy(): void {
        this.pendingRequests.forEach(({ timeout, reject }) => {
            clearTimeout(timeout);
            reject(new Error('Transport destroyed'));
        });
        this.pendingRequests.clear();
        this.eventCallbacks = [];

        const bridge = tonWindow.AndroidTonConnect;
        if (bridge) {
            delete bridge.__notifyResponse;
            delete bridge.__notifyEvent;
        }
    }
}

/**
 * Android WebView Bridge - Uses broadcast pattern for iframe support.
 * Same-origin iframes: Direct injection | Cross-origin iframes: postMessage relay
 */
const transport: Transport | undefined = isAndroidWebView ? new AndroidWebViewTransport() : undefined;

injectBridgeCode(window, { deviceInfo, walletInfo, isWalletBrowser: true }, transport);
