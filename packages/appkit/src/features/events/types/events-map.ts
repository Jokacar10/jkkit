/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CONNECTOR_EVENTS, WALLETS_EVENTS, PLUGIN_EVENTS } from '../constants/events';
import type { WalletConnectedPayload, WalletDisconnectedPayload, PluginRegisteredPayload } from './payload';
import type { WalletInterface } from '../../../types/wallet';

export interface AppKitEvents {
    // Connector events
    [CONNECTOR_EVENTS.CONNECTED]: WalletConnectedPayload;
    [CONNECTOR_EVENTS.DISCONNECTED]: WalletDisconnectedPayload;

    // Wallets events
    [WALLETS_EVENTS.UPDATED]: { wallets: WalletInterface[] };

    // Plugin events
    [PLUGIN_EVENTS.REGISTERED]: PluginRegisteredPayload;
}
