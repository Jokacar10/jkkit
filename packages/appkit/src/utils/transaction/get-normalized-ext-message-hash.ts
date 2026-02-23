/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { beginCell, storeMessage } from '@ton/core';
import type { Message } from '@ton/core';

/**
 * Generates a normalized hash of an "external-in" message for comparison.
 *
 * This function ensures consistent hashing of external-in messages by following [TEP-467].
 * See documentation: https://docs.ton.org/ecosystem/ton-connect/message-lookup#transaction-lookup-using-external-message-from-ton-connect
 *
 * @param message - The message to be normalized and hashed. Must be of type `external-in`.
 * @returns The hash of the normalized message as a Buffer.
 * @throws if the message type is not `external-in`.
 */
export function getNormalizedExtMessageHash(message: Message): Buffer {
    if (message.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${message.info.type}`);
    }

    const info = {
        ...message.info,
        src: undefined,
        importFee: 0n,
    };

    const normalizedMessage = {
        ...message,
        init: null,
        info: info,
    };

    return beginCell()
        .store(storeMessage(normalizedMessage, { forceRef: true }))
        .endCell()
        .hash();
}
