/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';
import { connect } from '../../actions/wallets/connect';
import type { ConnectParameters, ConnectReturnType } from '../../actions/wallets/connect';

export type ConnectMutationOptions = {
    mutationFn: (variables: ConnectParameters) => Promise<ConnectReturnType>;
    mutationKey: readonly unknown[];
};

export function connectMutationOptions(appKit: AppKit): ConnectMutationOptions {
    return {
        mutationFn: async (variables) => {
            return connect(appKit, variables);
        },
        mutationKey: ['connect'],
    };
}
