/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { DefiErrorCode } from '../errors';
import { DefiError } from '../errors';

export enum OnrampErrorCode {
    ProviderError = 'PROVIDER_ERROR',
    InvalidParams = 'INVALID_ONRAMP_PARAMS',
    QuoteFailed = 'QUOTE_FAILED',
    UrlBuildFailed = 'URL_BUILD_FAILED',
}

export class OnrampError extends DefiError {
    public readonly code: OnrampErrorCode | DefiErrorCode;

    constructor(message: string, code: OnrampErrorCode | DefiErrorCode, details?: unknown) {
        super(message, code, details);
        this.name = 'OnrampError';
        this.code = code;
    }
}
