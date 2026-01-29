/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { NetworkManager } from '@ton/walletkit';
import { Network } from '@ton/walletkit';
import type { TonConnectUI } from '@tonconnect/ui';

import { TonConnectWalletAdapter } from '../adapters/ton-connect-wallet-adapter';
import { CONNECTOR_EVENTS } from '../../../core/app-kit';
import type { Connector } from '../../../types/connector';
import type { WalletInterface } from '../../../types/wallet';
import type { AppKitEmitter } from '../../../core/app-kit';

export interface TonConnectConnectorConfig {
    id?: string;
    tonConnect: TonConnectUI;
}

export class TonConnectConnector implements Connector {
    readonly id: string;
    readonly type = 'tonconnect';

    private tonConnect: TonConnectUI;
    private networkManager: NetworkManager | null = null;
    private emitter: AppKitEmitter | null = null;
    private unsubscribeTonConnect: (() => void) | null = null;

    constructor(config: TonConnectConnectorConfig) {
        this.id = config.id ?? 'tonconnect-default';
        this.tonConnect = config.tonConnect;
    }

    async initialize(emitter: AppKitEmitter, networkManager: NetworkManager): Promise<void> {
        this.emitter = emitter;
        this.networkManager = networkManager;

        // Subscribe to TonConnect status changes
        this.unsubscribeTonConnect = this.tonConnect.onStatusChange((wallet) => {
            const wallets = this.getConnectedWallets();

            if (wallet) {
                this.emitter?.emit(CONNECTOR_EVENTS.CONNECTED, { wallets, connectorId: this.id }, this.id);
            } else {
                this.emitter?.emit(CONNECTOR_EVENTS.DISCONNECTED, { connectorId: this.id }, this.id);
            }
        });

        // Restore existing connection
        await this.tonConnect.connector.restoreConnection();
    }

    destroy(): void {
        this.unsubscribeTonConnect?.();
        this.unsubscribeTonConnect = null;
        this.emitter = null;
        this.networkManager = null;
    }

    async connectWallet(): Promise<void> {
        await this.tonConnect.openModal();
    }

    async disconnectWallet(): Promise<void> {
        await this.tonConnect.disconnect();
    }

    getConnectedWallets(): WalletInterface[] {
        if (!this.networkManager) {
            return [];
        }

        if (this.tonConnect.connected && this.tonConnect.wallet) {
            const wallet = this.tonConnect.wallet;
            const client = this.networkManager.getClient(Network.custom(wallet.account.chain));

            const walletAdapter = new TonConnectWalletAdapter({
                tonConnectWallet: wallet,
                tonConnect: this.tonConnect.connector,
                client,
            });

            return [walletAdapter];
        }

        return [];
    }
}
