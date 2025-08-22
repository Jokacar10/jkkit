import React, { memo, useMemo, useState } from 'react';
import type { EventTransactionRequest } from '@ton/walletkit';
import { fromNano, Address } from '@ton/ton';

import { Button } from './Button';
import { Card } from './Card';
import { createComponentLogger } from '../utils/logger';
import { formatUnits } from '../utils/units';

// Create logger for transaction request modal
const log = createComponentLogger('TransactionRequestModal');

interface TransactionRequestModalProps {
    request: EventTransactionRequest;
    isOpen: boolean;
    onApprove: () => void;
    onReject: (reason?: string) => void;
}

export const TransactionRequestModal: React.FC<TransactionRequestModalProps> = ({
    request,
    isOpen,
    onApprove,
    onReject,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await onApprove();
        } catch (error) {
            log.error('Failed to approve transaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = () => {
        onReject('User rejected the transaction');
    };

    const formatTON = (nanotons: string | bigint): string => {
        try {
            const value = typeof nanotons === 'string' ? BigInt(nanotons) : nanotons;
            return fromNano(value);
        } catch {
            return '0';
        }
    };

    const formatAddress = (address: string | Address): string => {
        try {
            const addr = typeof address === 'string' ? address : address.toString();
            if (!addr) return '';
            return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
        } catch {
            return '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <Card>
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900">Transaction Request</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                A dApp wants to send a transaction from your wallet
                            </p>
                        </div>

                        {/* Transaction Summary */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-900 mb-3">Transaction Summary</h3>

                            {/* Sender */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">From:</span>
                                <span className="text-sm font-mono text-black">
                                    {formatAddress(request.wallet?.getAddress() || '')}
                                </span>
                            </div>

                            {/* Network */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Network:</span>
                                <span className="text-sm text-black">
                                    {request.request.network === '-3'
                                        ? 'Testnet'
                                        : request.request.network === '-239'
                                          ? 'Mainnet'
                                          : 'Unknown'}
                                </span>
                            </div>

                            {/* Valid Until */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Valid Until:</span>
                                <span className="text-sm text-black">
                                    {new Date(request.request.valid_until * 1000).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Money Flow Summary */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Transaction Overview</h4>
                            <div className="space-y-3">
                                {/* TON Outputs */}
                                {/* {request.preview.moneyFlow.outputs > 0n && (
                                    <div className="border rounded-lg p-3 bg-red-50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-sm font-medium text-red-800">TON Outgoing</span>
                                                <p className="text-xs text-red-600">Amount you're sending</p>
                                            </div>
                                            <span className="text-lg font-bold text-red-700">
                                                -{formatTON(request.preview.moneyFlow.outputs)} TON
                                            </span>
                                        </div>
                                    </div>
                                )} */}

                                {/* TON Inputs */}
                                {/* {request.preview.moneyFlow.inputs > 0n && request.preview.moneyFlow.outputs > 0n && (
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div>Ton:</div>
                                            <div>
                                                {formatUnits(
                                                    request.preview.moneyFlow.inputs -
                                                        request.preview.moneyFlow.outputs,
                                                    9,
                                                )}{' '}
                                                TON
                                            </div>
                                        </div>
                                    </div>
                                )} */}

                                <JettonFlow
                                    jettonTransfers={request.preview.moneyFlow.jettonTransfers}
                                    ourAddress={request.preview.moneyFlow.ourAddress}
                                    tonDifference={request.preview.moneyFlow.inputs - request.preview.moneyFlow.outputs}
                                />

                                {/* No transfers message */}
                                {request.preview.moneyFlow.outputs === 0n &&
                                    request.preview.moneyFlow.inputs === 0n &&
                                    request.preview.moneyFlow.jettonTransfers.length === 0 && (
                                        <div className="border rounded-lg p-3 bg-gray-50">
                                            <p className="text-sm text-gray-600 text-center">
                                                This transaction doesn't involve any token transfers
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Wallet Information */}
                        {request.preview.moneyFlow.ourAddress && (
                            <div className="border rounded-lg p-4 bg-blue-50">
                                <h4 className="font-medium text-gray-900 mb-3">Wallet Information</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Your Wallet:</span>
                                    <span className="text-sm font-mono">
                                        {formatAddress(request.preview.moneyFlow.ourAddress)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Warning */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">
                                        <strong>Warning:</strong> This transaction will be irreversible. Only approve if
                                        you trust the requesting dApp and understand the transaction details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <Button variant="secondary" onClick={handleReject} disabled={isLoading} className="flex-1">
                                Reject
                            </Button>
                            <Button
                                onClick={handleApprove}
                                isLoading={isLoading}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Approve & Sign
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export const JettonNameDisplay = memo(function JettonNameDisplay({
    jettonAddress,
}: {
    jettonAddress: Address | string | undefined;
}) {
    // const jettonInfo = useJettonInfo(
    //     jettonAddress
    //         ? typeof jettonAddress === 'string' && jettonAddress !== 'TON'
    //             ? SafeParseAddress(jettonAddress)
    //             : jettonAddress
    //         : null,
    // );

    // const name = jettonInfo.jettonInfo?.metadata?.name;
    // return <div>{<AddressRow address={jettonAddress} text={name} />}</div>;
    return <div>{jettonAddress === 'TON' ? jettonAddress : 'USDT'}</div>;
});

export const JettonAmountDisplay = memo(function JettonAmountDisplay({
    amount,
    jettonAddress,
}: {
    amount: bigint;
    jettonAddress: Address | string | undefined;
}) {
    // const jettonInfo = useJettonInfo(
    //     jettonAddress
    //         ? typeof jettonAddress === 'string' && jettonAddress !== 'TON'
    //             ? SafeParseAddress(jettonAddress)
    //             : jettonAddress
    //         : null,
    // );
    // const decimals = parseInt(jettonInfo.jettonInfo?.metadata.decimals || '9') || 9;
    // const symbol = jettonInfo.jettonInfo?.metadata?.symbol || 'UNKWN';
    const decimals =
        jettonAddress === 'TON' ? 9 : jettonAddress === 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs' ? 6 : 9;
    const symbol = jettonAddress === 'TON' ? 'TON' : 'USDT';
    return (
        <div>
            {formatUnits(amount, decimals)} {symbol}
        </div>
    );
});

export const JettonImage = memo(function JettonImage({
    jettonAddress,
}: {
    jettonAddress: Address | string | undefined;
}) {
    // const jettonInfo = useJettonInfo(
    //     jettonAddress ? (typeof jettonAddress === 'string' ? Address.parse(jettonAddress) : jettonAddress) : null,
    // );

    // return <img src={jettonInfo.jettonInfo?.metadata.image} alt={jettonInfo.jettonInfo?.metadata.name} />;
    return <></>;
});

const JettonFlowItem = memo(function JettonFlowItem({
    jettonAddress,
    amount,
}: {
    jettonAddress: Address | string | undefined;
    amount: bigint;
}) {
    return (
        <div className="flex items-center">
            <span className="truncate max-w-[200px]">
                <JettonNameDisplay jettonAddress={jettonAddress} />
            </span>
            <div className={`flex ml-2 font-medium ${amount >= 0n ? 'text-green-600' : 'text-red-600'}`}>
                {amount >= 0n ? '+' : ''}
                <JettonAmountDisplay amount={amount} jettonAddress={jettonAddress} />
            </div>
        </div>
    );
});
export const JettonFlow = memo(function JettonFlow({
    jettonTransfers,
    tonDifference,
    ourAddress,
}: {
    jettonTransfers: { from: Address; to: Address; jetton: Address | null; amount: bigint }[];
    ourAddress: Address | null;
    tonDifference: bigint;
}) {
    // Group transfers by jetton and calculate net flow
    const jettonFlows = useMemo(() => {
        return jettonTransfers.reduce<Record<string, bigint>>((acc, transfer) => {
            const jettonKey = transfer.jetton?.toString() || 'unknown';
            console.log('jettonKey', jettonKey);
            if (jettonKey === 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez') {
                return acc;
            }
            if (jettonKey === 'EQBnGWMCf3-FZZq1W4IWcWiGAc3PHuZ0_H-7sad2oY00o83S') {
                return acc;
            }
            if (!acc[jettonKey]) {
                acc[jettonKey] = 0n;
            }

            // Add to balance if receiving tokens (to our address)
            // Subtract from balance if sending tokens (from our address)
            if (ourAddress && transfer.to.equals(ourAddress)) {
                acc[jettonKey] += transfer.amount;
            }
            if (ourAddress && transfer.from.equals(ourAddress)) {
                acc[jettonKey] -= transfer.amount;
            }

            return acc;
        }, {});
    }, [jettonTransfers, ourAddress?.toRawString()]);

    return (
        <div className="mt-2">
            <div className="font-semibold mb-1">Money Flow:</div>
            <JettonFlowItem jettonAddress={'TON'} amount={tonDifference} />
            {Object.entries(jettonFlows).length > 0 ? (
                Object.entries(jettonFlows).map(([jettonAddr, amount]) => (
                    <JettonFlowItem key={jettonAddr} jettonAddress={jettonAddr} amount={amount} />
                ))
            ) : (
                <></>
            )}
        </div>
    );
});
