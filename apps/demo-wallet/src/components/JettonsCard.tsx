import React, { useEffect } from 'react';

import { useJettons } from '../stores';
import { Button } from './Button';
import { Card } from './Card';
import { createComponentLogger } from '../utils/logger';

const log = createComponentLogger('JettonsCard');

interface JettonsCardProps {
    className?: string;
}

export const JettonsCard: React.FC<JettonsCardProps> = ({ className = '' }) => {
    const { userJettons, isLoadingJettons, error, loadUserJettons, formatJettonAmount } = useJettons();

    // Load jettons on mount if none are loaded
    useEffect(() => {
        log.info('userJettons', userJettons);
        log.info('isLoadingJettons', isLoadingJettons);
        if (userJettons.length === 0 && !isLoadingJettons) {
            log.info('Loading user jettons on mount');
            loadUserJettons();
        }
    }, [userJettons.length, isLoadingJettons, loadUserJettons]);

    const handleViewAll = () => {
        // TODO: Navigate to jettons page when created
        // This would navigate to a dedicated jettons page
    };

    const formatAddress = (address: string): string => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    // Show top 3 jettons by value or balance
    const topJettons = userJettons.slice(0, 3);

    const totalJettons = userJettons.length;
    const totalValue = userJettons.reduce((sum, jetton) => {
        return sum + (jetton.usdValue ? parseFloat(jetton.usdValue) : 0);
    }, 0);

    if (error) {
        return (
            <Card title="Jettons" className={className}>
                <div className="text-center py-4">
                    <div className="text-red-400 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="text-sm text-red-600 mb-3">Failed to load jettons</p>
                    <Button size="sm" variant="secondary" onClick={() => loadUserJettons()}>
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Jettons" className={className}>
            {isLoadingJettons ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-sm text-gray-600">Loading jettons...</span>
                </div>
            ) : totalJettons === 0 ? (
                <div className="text-center py-6">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-500">No jettons yet</p>
                    <p className="text-xs text-gray-400 mt-1">Your token balances will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-900">{totalJettons} Tokens</p>
                            {totalValue > 0 && <p className="text-xs text-gray-500">≈ ${totalValue.toFixed(2)} USD</p>}
                        </div>
                        <Button size="sm" variant="secondary" onClick={handleViewAll}>
                            View All
                        </Button>
                    </div>

                    {/* Top Jettons */}
                    <div className="space-y-2">
                        {topJettons.map((jetton) => (
                            <div
                                key={jetton.address}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        {jetton.image ? (
                                            <img
                                                src={jetton.image}
                                                alt={jetton.name}
                                                className="w-6 h-6 rounded-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to initials if image fails to load
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = jetton.symbol.slice(0, 2);
                                                        parent.className += ' text-xs font-bold text-gray-600';
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-gray-600">
                                                {jetton.symbol.slice(0, 2)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {jetton.name || jetton.symbol}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatAddress(jetton.address)}
                                            {jetton.verification?.verified && (
                                                <span className="ml-1 text-green-600">✓</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatJettonAmount(jetton.balance, jetton.decimals)}
                                    </p>
                                    <p className="text-xs text-gray-500">{jetton.symbol}</p>
                                    {jetton.usdValue && <p className="text-xs text-gray-400">≈ ${jetton.usdValue}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalJettons > 3 && (
                        <div className="text-center pt-2">
                            <p className="text-xs text-gray-500">Showing 3 of {totalJettons} tokens</p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};
