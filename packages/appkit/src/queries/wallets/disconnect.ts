/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';
import { disconnect } from '../../actions/wallets/disconnect';
import type { DisconnectParameters, DisconnectReturnType } from '../../actions/wallets/disconnect';

export type DisconnectMutationOptions = {
    mutationFn: (variables: DisconnectParameters) => Promise<DisconnectReturnType>;
    mutationKey: readonly unknown[];
};

export function disconnectMutationOptions(appKit: AppKit): DisconnectMutationOptions {
    return {
        mutationFn: async (variables) => {
            return disconnect(appKit, variables);
        },
        mutationKey: ['disconnect'],
    };
}
