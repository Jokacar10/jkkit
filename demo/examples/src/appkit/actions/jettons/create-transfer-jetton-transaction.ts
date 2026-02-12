/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '@ton/appkit';
import { createTransferJettonTransaction } from '@ton/appkit';

export const createTransferJettonTransactionExample = async (appKit: AppKit) => {
    // SAMPLE_START: CREATE_TRANSFER_JETTON_TRANSACTION
    const tx = await createTransferJettonTransaction(appKit, {
        jettonAddress: 'EQDBE420tTQIkoWcZ9pEOTKY63WVmwyIl3hH6yWl0r_h51Tl',
        recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        amount: '100',
        comment: 'Hello Jetton',
    });
    console.log('Transfer Transaction:', tx);
    // SAMPLE_END: CREATE_TRANSFER_JETTON_TRANSACTION
};
