import React, { useState } from 'react';
import type { EventTransactionRequest } from '@ton/walletkit';

import { Button } from './Button';
import { Card } from './Card';
import { createComponentLogger } from '../utils/logger';

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

    const formatAddress = (address: string): string => {
        if (!address) return '';
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    const formatTON = (nanotons: string): string => {
        try {
            const value = BigInt(nanotons);
            const tons = Number(value) / 1e9;
            return tons.toFixed(4);
        } catch {
            return '0';
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
                                <span className="text-sm font-mono">{formatAddress(request.request.from)}</span>
                            </div>

                            {/* Network */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Network:</span>
                                <span className="text-sm">
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
                                <span className="text-sm">
                                    {new Date(request.request.valid_until * 1000).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Transaction Messages */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                                Messages ({request.preview.messages?.length || 0})
                            </h4>
                            <div className="space-y-3">
                                {request.preview.messages?.map((message, index) => (
                                    <div key={index} className="border rounded-lg p-3 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-gray-500">Message {index + 1}</span>
                                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                                {message.type || 'TON'}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">To:</span>
                                                <span className="text-sm font-mono">
                                                    {formatAddress(message.to || 'Unknown')}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Amount:</span>
                                                <span className="text-sm font-semibold">
                                                    {message.valueTON ? `${formatTON(message.valueTON)} TON` : '0 TON'}
                                                </span>
                                            </div>

                                            {message.comment && (
                                                <div className="mt-2">
                                                    <span className="text-sm text-gray-600">Comment:</span>
                                                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                                                        {message.comment}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transaction Fees and Balance Impact */}
                        {request.preview && (
                            <div className="border rounded-lg p-4 bg-blue-50">
                                <h4 className="font-medium text-gray-900 mb-3">Estimated Impact</h4>

                                {request.preview.totalFees && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Network Fees:</span>
                                        <span className="text-sm font-semibold text-red-600">
                                            -{formatTON(request.preview.totalFees)} TON
                                        </span>
                                    </div>
                                )}

                                {request.preview.balanceBefore && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Current Balance:</span>
                                        <span className="text-sm">{formatTON(request.preview.balanceBefore)} TON</span>
                                    </div>
                                )}

                                {request.preview.balanceAfter && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">After Transaction:</span>
                                        <span className="text-sm font-semibold">
                                            {formatTON(request.preview.balanceAfter)} TON
                                        </span>
                                    </div>
                                )}

                                {request.preview.willBounce && (
                                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-4 h-4 text-yellow-600 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-xs text-yellow-700">This transaction may bounce</span>
                                        </div>
                                    </div>
                                )}
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
