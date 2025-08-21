// Disconnect event handler

import type { EventDisconnect } from '../types';
import type { RawBridgeEvent, EventHandler, RawBridgeEventGeneric } from '../types/internal';
import { BasicHandler } from './BasicHandler';

export class DisconnectHandler
    extends BasicHandler<EventDisconnect>
    implements EventHandler<EventDisconnect, RawBridgeEventGeneric>
{
    canHandle(event: RawBridgeEvent): event is RawBridgeEventGeneric {
        return event.method === 'disconnect';
    }

    async handle(event: RawBridgeEvent): Promise<EventDisconnect> {
        if (!event.wallet) {
            throw new Error('No wallet found in event');
        }

        const reason = this.extractDisconnectReason(event);

        const disconnectEvent: EventDisconnect = {
            reason,
            wallet: event.wallet,
        };

        return disconnectEvent;
    }

    /**
     * Extract disconnect reason from bridge event
     */
    private extractDisconnectReason(event: RawBridgeEventGeneric): string | undefined {
        const params = event.params || {};

        // Check various possible fields for reason
        const reason = params.reason || params.message || params.error || params.cause;

        if (typeof reason === 'string' && reason.length > 0) {
            return reason.slice(0, 200); // Limit length
        }

        // No specific reason provided
        return undefined;
    }
}
