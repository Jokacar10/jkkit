/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { TonWalletKit, CHAIN, createDeviceInfo, createWalletManifest } from '@ton/walletkit';
import type { ITonWalletKit } from '@ton/walletkit';

import { createComponentLogger } from '../../utils/logger';
import { isExtension } from '../../utils/isExtension';
import { getTonConnectDeviceInfo, getTonConnectWalletManifest } from '../../utils/walletManifest';
import type { SetState, WalletCoreSliceCreator } from '../../types/store';
import type { WalletKitConfig } from '../../types/wallet';

const log = createComponentLogger('WalletCoreSlice');

/**
 * Creates a WalletKit instance with the specified network configuration
 */
function createWalletKitInstance(walletKitConfig?: WalletKitConfig): ITonWalletKit {
    const walletKit = new TonWalletKit({
        deviceInfo: createDeviceInfo(getTonConnectDeviceInfo()),
        walletManifest: createWalletManifest(getTonConnectWalletManifest()),

        bridge: {
            bridgeUrl: walletKitConfig?.bridgeUrl,
            disableHttpConnection: walletKitConfig?.disableHttpBridge,
            jsBridgeTransport: walletKitConfig?.jsBridgeTransport,
        },

        networks: {
            [CHAIN.MAINNET]: {
                apiClient: {
                    url: 'https:/toncenter.com',
                    key: walletKitConfig?.tonApiKeyMainnet,
                },
            },
            [CHAIN.TESTNET]: {
                apiClient: {
                    url: 'https://testnet.toncenter.com',
                    key: walletKitConfig?.tonApiKeyTestnet,
                },
            },
        },

        storage: walletKitConfig?.storage,

        analytics: {
            enabled: true,
        },

        dev: {
            disableNetworkSend: walletKitConfig?.disableNetworkSend,
        },
    }) as ITonWalletKit;

    log.info(`WalletKit initialized with network: ${isExtension() ? 'extension' : 'web'}`);
    return walletKit;
}

export const createWalletCoreSlice =
    (walletKitConfig: WalletKitConfig): WalletCoreSliceCreator =>
    (set: SetState, get) => ({
        walletCore: {
            walletKit: null,
            isWalletKitInitialized: false,
            initializationError: null,
        },

        initializeWalletKit: async (network: 'mainnet' | 'testnet' = 'testnet'): Promise<void> => {
            const state = get();

            // Check if we need to reinitialize
            if (state.walletCore.walletKit) {
                log.info(`Reinitializing WalletKit to ${network}`);

                try {
                    const existingWallets = state.walletCore.walletKit.getWallets();
                    log.info(`Clearing ${existingWallets.length} existing wallets before reinitialization`);
                } catch (error) {
                    log.warn('Error during cleanup:', error);
                }
            }

            // Create new WalletKit instance
            const walletKit = createWalletKitInstance(walletKitConfig);

            // Wait for WalletKit to be ready with 10 second timeout
            const startTime = Date.now();
            const timeout = 10000; // 10 seconds

            while (!walletKit?.isReady()) {
                if (Date.now() - startTime > timeout) {
                    log.error('WalletKit initialization timeout after 10 seconds');

                    set((state) => {
                        state.walletCore.initializationError = 'Initialization timeout';
                        state.walletCore.isWalletKitInitialized = false;
                    });

                    return;
                }

                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            get().setupTonConnectListeners(walletKit);

            set((state) => {
                state.walletCore.walletKit = walletKit;
                state.walletCore.isWalletKitInitialized = true;
                state.walletCore.initializationError = null;
            });

            // Load all saved wallets into the WalletKit instance
            await get().loadSavedWalletsIntoKit(walletKit);
        },
    });
