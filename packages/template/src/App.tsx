/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    TonConnectButton,
    SendTonButton,
    SwapWidget,
    StakingWidget,
    NftItem,
    useAddress,
    useBalance,
    useWatchBalance,
    useJettons,
    useNfts,
    Network,
} from '@ton/appkit-react';
import type { AppkitUIToken } from '@ton/appkit-react';

import { SwapBody } from './SwapBody';
import './App.css';

const amountFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
    useGrouping: false,
});

function formatAmount(value: string): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    return amountFormatter.format(n);
}

const SWAP_TOKENS: AppkitUIToken[] = [
    {
        symbol: 'TON',
        name: 'Toncoin',
        decimals: 9,
        address: 'ton',
        network: Network.mainnet(),
        logo: 'https://asset.ston.fi/img/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c/c8d21a3d93f9b574381e0a8d8f16d48b325dd8f54ce172f599c1e9d6c62f03f7',
    },
    {
        symbol: 'USD₮',
        name: 'Tether USD',
        decimals: 6,
        address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        network: Network.mainnet(),
        logo: 'https://asset.ston.fi/img/EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs/1a87edfee9a28b05578853952e5effb8cc30af1e0fb90043aa2ce19dce490849',
    },
];

export function App() {
    const address = useAddress();
    useWatchBalance(); // WS subscription → useBalance cache
    const { data: balance, isLoading: balanceLoading } = useBalance();
    const { data: jettonsData } = useJettons();
    const { data: nftsData } = useNfts();

    const jettons = jettonsData?.jettons ?? [];
    const nfts = nftsData?.nfts ?? [];
    // useBalance returns a pre-formatted decimal string; don't re-format with formatUnits.
    const balanceText = balance != null ? `${formatAmount(balance)} TON` : '—';
    const showBalanceLoading = balance == null && balanceLoading;

    return (
        <div className="app">
            <header className="app-header">
                <div className="app-title">
                    <img src="/favicon.svg" alt="" className="app-logo" />
                    <h1>TON Kit Demo</h1>
                </div>
                <TonConnectButton />
            </header>

            {!address && (
                <section className="card empty">
                    <p>Connect a wallet to explore balance, jettons, NFTs, swap and staking.</p>
                </section>
            )}

            {address && (
                <>
                    <section className="card">
                        <h2>Balance</h2>
                        <p className="big">{showBalanceLoading ? '—' : balanceText}</p>
                    </section>

                    <section className="card">
                        <h2>Send 0.01 TON to self</h2>
                        <SendTonButton recipientAddress={address} amount="0.01" />
                    </section>

                    {jettons.length > 0 && (
                        <section className="card">
                            <h2>Jettons ({jettons.length})</h2>
                            <ul className="jetton-list">
                                {jettons.slice(0, 5).map((j) => {
                                    const logoUrl = j.info.image?.smallUrl ?? j.info.image?.url;
                                    return (
                                        <li key={j.address} className="jetton-row">
                                            {logoUrl ? (
                                                <img
                                                    className="jetton-logo"
                                                    src={logoUrl}
                                                    alt={j.info.symbol ?? ''}
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <span className="jetton-logo jetton-logo-fallback">
                                                    {(j.info.symbol ?? '?')[0]}
                                                </span>
                                            )}
                                            <span className="jetton-symbol">{j.info.symbol ?? 'Jetton'}</span>
                                            <span className="jetton-balance">{formatAmount(j.balance)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}

                    {nfts.length > 0 && (
                        <section className="card">
                            <h2>NFTs ({nfts.length})</h2>
                            <div className="nft-grid">
                                {nfts.slice(0, 6).map((nft) => (
                                    <NftItem key={nft.address} nft={nft} />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="card">
                        <h2>Swap</h2>
                        <SwapWidget
                            tokens={SWAP_TOKENS}
                            network={Network.mainnet()}
                            fiatSymbol="$"
                            defaultFromSymbol="TON"
                            defaultToSymbol="USD₮"
                        >
                            {(ctx) => <SwapBody ctx={ctx} />}
                        </SwapWidget>
                    </section>

                    <section className="card">
                        <h2>Staking</h2>
                        <div className="staking-wrap">
                            <StakingWidget network={Network.mainnet()} />
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
