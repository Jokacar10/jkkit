/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { asAddressFriendly } from '@ton/appkit';
import { useGaslessTonTransferQuote, useSendGaslessTransaction } from '@ton/appkit-react';

export const UseGaslessTonTransferQuoteExample = () => {
    // SAMPLE_START: USE_GASLESS_TON_TRANSFER_QUOTE
    const { data: quote, isFetching } = useGaslessTonTransferQuote({
        recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        amount: '1.5',
        feeAsset: asAddressFriendly('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'), // USDT
    });

    const { mutateAsync: sendGasless, isPending } = useSendGaslessTransaction();

    return (
        <div>
            {isFetching && <span>Quoting...</span>}
            {quote && (
                <>
                    <div>Fee: {quote.fee}</div>
                    <button disabled={isPending} onClick={() => sendGasless({ quote })}>
                        Send
                    </button>
                </>
            )}
        </div>
    );
    // SAMPLE_END: USE_GASLESS_TON_TRANSFER_QUOTE
};
