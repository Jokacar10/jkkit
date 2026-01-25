/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Events Feature
 *
 * Centralized event system for AppKit plugin communication.
 * Provides Emitter implementation and predefined event types.
 */
export { Emitter } from './services/emitter';
export { CONNECTOR_EVENTS, WALLETS_EVENTS, PLUGIN_EVENTS } from './constants/events';

export type { EventPayload, AppKitEvent, EventListener } from './types/event-bus';
export type { AppKitEvents } from './types/events-map';
export type { WalletConnectedPayload, WalletDisconnectedPayload, PluginRegisteredPayload } from './types/payload';
