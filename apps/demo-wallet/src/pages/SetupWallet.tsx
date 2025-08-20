import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Layout, Button, Card, MnemonicDisplay, ImportWallet } from '../components';
import { useTonWallet } from '../hooks';

type SetupMode = 'select' | 'create' | 'import';

export const SetupWallet: React.FC = () => {
    const [mode, setMode] = useState<SetupMode>('select');
    const [mnemonic, setMnemonic] = useState<string[]>([]);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const navigate = useNavigate();
    const { createNewWallet, importWallet } = useTonWallet();

    const handleCreateWallet = async () => {
        setError('');
        setIsLoading(true);

        try {
            const newMnemonic = await createNewWallet();
            setMnemonic(newMnemonic);
            setMode('create');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create wallet');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImportWallet = async (mnemonicArray: string[]) => {
        setError('');
        setIsLoading(true);

        try {
            if (mnemonicArray.length !== 12 && mnemonicArray.length !== 24) {
                throw new Error('Mnemonic must be 12 or 24 words');
            }

            await importWallet(mnemonicArray);
            navigate('/wallet');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import wallet');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmMnemonic = async () => {
        try {
            // Wallet is already created, just navigate
            navigate('/wallet');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to confirm wallet');
        }
    };

    if (mode === 'select') {
        return (
            <Layout title="Setup Wallet">
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Setup Your Wallet</h2>
                        <p className="mt-2 text-sm text-gray-600">Create a new wallet or import an existing one.</p>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <div className="space-y-4">
                                <Button onClick={handleCreateWallet} isLoading={isLoading} className="w-full">
                                    Create New Wallet
                                </Button>
                                <p className="text-xs text-gray-500 text-center">
                                    Generate a new 24-word recovery phrase
                                </p>
                            </div>
                        </Card>

                        <Card>
                            <div className="space-y-4">
                                <Button variant="secondary" onClick={() => setMode('import')} className="w-full">
                                    Import Existing Wallet
                                </Button>
                                <p className="text-xs text-gray-500 text-center">
                                    Restore wallet using recovery phrase
                                </p>
                            </div>
                        </Card>
                    </div>

                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                </div>
            </Layout>
        );
    }

    if (mode === 'create') {
        return (
            <Layout title="Your Recovery Phrase">
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Save Your Recovery Phrase</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Write down these 24 words in the exact order shown.
                        </p>
                    </div>

                    <Card>
                        <div className="space-y-4">
                            <div className="relative">
                                <div className={!showMnemonic ? 'blur-sm' : ''}>
                                    <MnemonicDisplay
                                        mnemonic={mnemonic}
                                        showWarning={true}
                                        warningType="yellow"
                                        warningText="Keep this phrase safe and secret. Anyone with access to it can control your wallet."
                                    />
                                </div>

                                {!showMnemonic && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Button onClick={() => setShowMnemonic(true)} size="sm">
                                            Click to reveal
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {showMnemonic && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="saved"
                                            checked={isSaved}
                                            onChange={(e) => setIsSaved(e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="saved" className="text-sm text-gray-700">
                                            I have safely saved my recovery phrase
                                        </label>
                                    </div>

                                    <Button onClick={handleConfirmMnemonic} disabled={!isSaved} className="w-full">
                                        Continue
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Import Wallet">
            <Card>
                <ImportWallet
                    onImport={handleImportWallet}
                    onBack={() => setMode('select')}
                    isLoading={isLoading}
                    error={error}
                />
            </Card>
        </Layout>
    );
};
