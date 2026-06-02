/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useState } from 'react';
import { SwapWidgetUI } from '@ton/appkit-react';
import type { SwapWidgetRenderProps } from '@ton/appkit-react';

import { SwapInsufficientNotice } from './SwapInsufficientNotice';

// TODO(kit): drop once SwapWidgetProvider exposes submit errors via ctx.
type SwapBodyProps = {
    ctx: SwapWidgetRenderProps;
};

export function SwapBody({ ctx }: SwapBodyProps) {
    const [submitError, setSubmitError] = useState<string | null>(null);

    const sendSwapTransaction = useCallback(async () => {
        setSubmitError(null);
        try {
            await ctx.sendSwapTransaction();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : String(error));
        }
    }, [ctx]);

    return (
        <>
            <SwapWidgetUI {...ctx} sendSwapTransaction={sendSwapTransaction} />
            <SwapInsufficientNotice
                fromToken={ctx.fromToken}
                fromAmount={ctx.fromAmount}
                fromBalance={ctx.fromBalance}
            />
            {submitError && (
                <div className="swap-error" role="alert">
                    <span>
                        <strong>Swap error:</strong> {submitError}
                    </span>
                    <button
                        type="button"
                        className="swap-error-dismiss"
                        onClick={() => setSubmitError(null)}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
}
