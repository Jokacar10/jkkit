/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// TODO(kit): drop once SwapWidget runs a pre-build TON-for-gas check.
import { useBalance } from '@ton/appkit-react';
import type { AppkitUIToken } from '@ton/appkit-react';

const GAS_RESERVE_TON = 0.35;

type SwapInsufficientNoticeProps = {
    fromToken: AppkitUIToken | null;
    fromAmount: string;
    fromBalance: string | undefined;
};

function parseDecimal(value: string | undefined): number | null {
    if (!value) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

export function SwapInsufficientNotice({ fromToken, fromAmount, fromBalance }: SwapInsufficientNoticeProps) {
    // Gas is paid in TON regardless of which token is going out.
    const { data: tonBalanceData } = useBalance();

    const amount = parseDecimal(fromAmount);
    const fromBalanceNum = parseDecimal(fromBalance);
    const tonBalance = parseDecimal(tonBalanceData);

    if (!fromToken || amount == null || amount <= 0) return null;

    const isFromTon = fromToken.address === 'ton';
    let shortfallTon = 0;

    if (isFromTon) {
        if (fromBalanceNum == null) return null;
        shortfallTon = amount + GAS_RESERVE_TON - fromBalanceNum;
    } else {
        if (tonBalance == null) return null;
        shortfallTon = GAS_RESERVE_TON - tonBalance;
    }

    if (shortfallTon <= 0) return null;

    const message = isFromTon
        ? `Not enough TON for swap + gas. Reduce the amount or top up by ~${shortfallTon.toFixed(3)} TON.`
        : `Not enough TON for gas (~${GAS_RESERVE_TON} TON needed). Top up by ~${shortfallTon.toFixed(3)} TON.`;

    return (
        <div className="swap-notice" role="status">
            {message}
        </div>
    );
}
