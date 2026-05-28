/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Feature, SignMessageFeature, StructuredItemType } from '@tonconnect/protocol';

import { globalLogger } from '../core/Logger';

const log = globalLogger.createChild('checkSignMessageSupport');

export interface CheckSignMessageSupportOptions {
    /** Number of messages the caller intends to sign. */
    requiredMessagesNumber: number;
    /** Set when the request carries extra-currency transfers. */
    requireExtraCurrencies?: boolean;
    /** Set when the request carries structured items (ton / jetton / nft). */
    requiredItemTypes?: StructuredItemType[];
}

/** Discrete failure modes of {@link checkSignMessageSupport}. */
export enum SupportErrorCode {
    /** Wallet did not advertise the `SignMessage` feature at all. */
    NotSupported = 'NOT_SUPPORTED',
    /** Wallet's `maxMessages` cap is lower than `requiredMessagesNumber`. */
    TooManyMessages = 'TOO_MANY_MESSAGES',
    /** Request includes extra-currency transfers, wallet's feature flag is not set. */
    ExtraCurrencyNotSupported = 'EXTRA_CURRENCY_NOT_SUPPORTED',
    /** Request requires structured item types the wallet did not list. */
    ItemTypesNotSupported = 'ITEM_TYPES_NOT_SUPPORTED',
}

/**
 * Thrown by {@link checkSignMessageSupport}. The `code` discriminates the
 * specific failure so callers can map it to their own typed errors without
 * parsing the message string.
 */
export class SupportError extends Error {
    public readonly code: SupportErrorCode;
    public readonly feature?: SignMessageFeature;
    public readonly unsupportedItemTypes?: StructuredItemType[];

    constructor(message: string, code: SupportErrorCode) {
        super(message);
        this.name = 'SupportError';
        this.code = code;
    }
}

/**
 * Throws {@link SupportError} (with a `code` discriminating the
 * specific failure) when the connected wallet's advertised `Feature[]` cannot
 * satisfy a SignMessage request — feature missing, `maxMessages` too low,
 * missing extra-currency / item-type support. Logs a warning when the wallet
 * didn't declare `maxMessages` (request may still be rejected by the wallet).
 */
export function checkSignMessageSupport(features: Feature[], options: CheckSignMessageSupportOptions): never | void {
    const signMessageFeature = features.find(
        (feature): feature is SignMessageFeature =>
            !!feature && typeof feature === 'object' && feature.name === 'SignMessage',
    );

    if (!signMessageFeature) {
        throw new SupportError("Wallet doesn't support SignMessage feature.", SupportErrorCode.NotSupported);
    }

    if (options.requireExtraCurrencies && !signMessageFeature.extraCurrencySupported) {
        throw new SupportError(
            'Wallet is not able to handle such SignMessage request. Extra currencies support is required.',
            SupportErrorCode.ExtraCurrencyNotSupported,
        );
    }

    if (options.requiredItemTypes?.length) {
        const supportedTypes = signMessageFeature.itemTypes ?? [];
        const unsupportedTypes = options.requiredItemTypes.filter((type) => !supportedTypes.includes(type));
        if (unsupportedTypes.length) {
            throw new SupportError(
                signMessageFeature.itemTypes
                    ? `Wallet doesn't support item types: ${unsupportedTypes.join(', ')} in SignMessage.`
                    : "Wallet doesn't support structured items in SignMessage.",
                SupportErrorCode.ItemTypesNotSupported,
            );
        }
    }

    if (signMessageFeature.maxMessages !== undefined) {
        if (signMessageFeature.maxMessages < options.requiredMessagesNumber) {
            throw new SupportError(
                `Wallet is not able to handle such SignMessage request. Max support messages number is ${signMessageFeature.maxMessages}, but ${options.requiredMessagesNumber} is required.`,
                SupportErrorCode.TooManyMessages,
            );
        }
        return;
    }

    log.warn(
        "Connected wallet didn't provide information about max allowed messages in the SignMessage request. Request may be rejected by the wallet.",
    );
}
