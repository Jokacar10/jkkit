/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { DefiErrorCode } from '../errors';
import { DefiError } from '../errors';

export enum StakingErrorCode {
    InvalidParams = 'INVALID_PARAMS',
    UnsupportedOperation = 'UNSUPPORTED_OPERATION',
}

export class StakingError extends DefiError {
    public readonly code: StakingErrorCode | DefiErrorCode;

    constructor(message: string, code: StakingErrorCode | DefiErrorCode, details?: unknown) {
        super(message, code, details);
        this.name = 'StakingError';
        this.code = code;
    }
}
