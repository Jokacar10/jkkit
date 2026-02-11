/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AppKit } from '@ton/appkit';
import { TonConnectConnector } from '@ton/appkit/tonconnect';
import {
    watchConnectedWallets,
    watchSelectedWallet,
    getConnectedWallets,
    getSelectedWallet,
    setSelectedWalletId,
} from '@ton/appkit';

export const setupAppKitExample = () => {
    // Initialize AppKit
    const appKit = new AppKit({
        networks: {
            '-239': {}, // Mainnet
        },
        connectors: [
            new TonConnectConnector({
                tonConnectOptions: {
                    manifestUrl: 'https://my-app.com/tonconnect-manifest.json',
                },
            }),
        ],
    });

    return appKit;
};

export const walletConnectionExample = (appKit: AppKit) => {
    // Watch for connected wallets
    const _close = watchConnectedWallets(appKit, {
        onChange: (wallets) => {
            console.log('Connected wallets:', wallets);
        },
    });

    // Watch for selected wallet
    const _closeSelected = watchSelectedWallet(appKit, {
        onChange: (wallet) => {
            console.log('Selected wallet:', wallet);
        },
    });

    // Get current state
    const wallets = getConnectedWallets(appKit);
    const _selected = getSelectedWallet(appKit);

    // Select a specific wallet
    if (wallets.length > 0) {
        setSelectedWalletId(appKit, { walletId: wallets[0].getWalletId() });
    }
};
