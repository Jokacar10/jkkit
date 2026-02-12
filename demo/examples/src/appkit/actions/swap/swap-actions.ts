/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit, Network } from '@ton/appkit';
import { getSwapManager, getSwapQuote, buildSwapTransaction, sendTransaction } from '@ton/appkit';

export const swapExample = async (appKit: AppKit) => {
    // SAMPLE_START: GET_SWAP_MANAGER
    const swapManager = getSwapManager(appKit);
    // SAMPLE_END: GET_SWAP_MANAGER

    // SAMPLE_START: GET_SWAP_QUOTE
    const quote = await getSwapQuote(appKit, {
        fromToken: { type: 'jetton', value: 'EQCA14o1-VWhS29szfbpmbu_m7A_9S4m_Ba6sAyALH_mU68j' },
        toToken: { type: 'ton' },
        amount: BigInt('1000000000').toString(), // nanotons as string
        network: 'mainnet' as unknown as Network,
    });
    console.log('Swap Quote:', quote);
    // SAMPLE_END: GET_SWAP_QUOTE

    // SAMPLE_START: BUILD_SWAP_TRANSACTION
    const transactionRequest = await buildSwapTransaction(appKit, {
        quote,
        userAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        slippageBps: 100, // 1%
    });
    const transactionResponse = await sendTransaction(appKit, transactionRequest);
    console.log('Swap Transaction:', transactionResponse);
    // SAMPLE_END: BUILD_SWAP_TRANSACTION

    return { swapManager, quote, transactionRequest };
};
