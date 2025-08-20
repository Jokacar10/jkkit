import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { storage, STORAGE_KEYS, SimpleEncryption } from '../utils';
import { useAuthStore } from './authStore';
import type { Transaction, WalletState } from '../types/wallet';

interface WalletStore extends WalletState {
    // Transaction history
    transactions: Transaction[];

    // Actions
    createWallet: (mnemonic: string[]) => Promise<void>;
    importWallet: (mnemonic: string[]) => Promise<void>;
    loadWallet: () => Promise<void>;
    clearWallet: () => void;
    updateBalance: (balance: string) => void;
    addTransaction: (transaction: Transaction) => void;

    // Getters
    getDecryptedMnemonic: () => Promise<string[] | null>;
}

export const useWalletStore = create<WalletStore>()(
    persist(
        (set, get) => ({
            // Initial state
            isAuthenticated: false,
            hasWallet: false,
            transactions: [],

            // Actions
            createWallet: async (mnemonic: string[]) => {
                const authState = useAuthStore.getState();
                if (!authState.currentPassword) {
                    throw new Error('User not authenticated');
                }

                try {
                    // Encrypt and store the mnemonic
                    const encryptedMnemonic = await SimpleEncryption.encrypt(
                        JSON.stringify(mnemonic),
                        authState.currentPassword,
                    );

                    storage.set(STORAGE_KEYS.ENCRYPTED_MNEMONIC, encryptedMnemonic);

                    // Generate wallet details from mnemonic
                    const mockAddress = 'EQBvI0aFLnw2QbZeUOETQdwQceZl0OOl-0KaJYQs3LiJayNM';
                    const mockPublicKey = mnemonic.join('').slice(0, 64);

                    // Store wallet details
                    const walletData = {
                        address: mockAddress,
                        publicKey: mockPublicKey,
                        balance: '2621200000000', // 2.6212 TON in nanoTON
                    };

                    // Save wallet data separately from mnemonic
                    storage.set(STORAGE_KEYS.WALLET_STATE, walletData);

                    set({
                        hasWallet: true,
                        isAuthenticated: true,
                        address: mockAddress,
                        publicKey: mockPublicKey,
                        balance: walletData.balance,
                        mnemonic: undefined, // Never store in memory
                    });
                } catch (error) {
                    console.error('Error creating wallet:', error);
                    throw new Error('Failed to create wallet');
                }
            },

            importWallet: async (mnemonic: string[]) => {
                // Same as create wallet - we encrypt and store the mnemonic
                return get().createWallet(mnemonic);
            },

            loadWallet: async () => {
                const authState = useAuthStore.getState();
                if (!authState.currentPassword) {
                    throw new Error('User not authenticated');
                }

                try {
                    // Check if we have an encrypted mnemonic
                    const encryptedMnemonic = storage.get<string>(STORAGE_KEYS.ENCRYPTED_MNEMONIC);
                    if (!encryptedMnemonic) {
                        set({ hasWallet: false, isAuthenticated: false });
                        return;
                    }

                    // Load wallet data
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const walletData = storage.get<any>(STORAGE_KEYS.WALLET_STATE);
                    if (walletData) {
                        set({
                            hasWallet: true,
                            isAuthenticated: true,
                            address: walletData.address,
                            publicKey: walletData.publicKey,
                            balance: walletData.balance || '2621200000000', // Default balance if not set
                        });
                    } else {
                        // Fallback: we have mnemonic but no wallet data, reconstruct it
                        try {
                            const decryptedString = await SimpleEncryption.decrypt(
                                encryptedMnemonic,
                                authState.currentPassword,
                            );
                            const mnemonic = JSON.parse(decryptedString) as string[];

                            // Regenerate wallet data
                            const mockAddress = 'EQBvI0aFLnw2QbZeUOETQdwQceZl0OOl-0KaJYQs3LiJayNM';
                            const mockPublicKey = mnemonic.join('').slice(0, 64);
                            const balance = '2621200000000';

                            const newWalletData = {
                                address: mockAddress,
                                publicKey: mockPublicKey,
                                balance: balance,
                            };

                            // Save the regenerated wallet data
                            storage.set(STORAGE_KEYS.WALLET_STATE, newWalletData);

                            set({
                                hasWallet: true,
                                isAuthenticated: true,
                                address: mockAddress,
                                publicKey: mockPublicKey,
                                balance: balance,
                            });
                        } catch (decryptError) {
                            console.error('Error reconstructing wallet data:', decryptError);
                            set({ hasWallet: false, isAuthenticated: false });
                        }
                    }
                } catch (error) {
                    console.error('Error loading wallet:', error);
                    set({ hasWallet: false, isAuthenticated: false });
                }
            },

            getDecryptedMnemonic: async (): Promise<string[] | null> => {
                const authState = useAuthStore.getState();

                // Debug: Check if we have current password
                if (!authState.currentPassword) {
                    console.error('No current password available');
                    return null;
                }

                try {
                    const encryptedMnemonic = storage.get<string>(STORAGE_KEYS.ENCRYPTED_MNEMONIC);

                    // Debug: Check if we have encrypted data
                    if (!encryptedMnemonic) {
                        console.error('No encrypted mnemonic found in storage');
                        return null;
                    }

                    // Debug: Attempt decryption
                    const decryptedString = await SimpleEncryption.decrypt(
                        encryptedMnemonic,
                        authState.currentPassword,
                    );

                    const mnemonic = JSON.parse(decryptedString) as string[];

                    // Debug: Check result
                    if (!mnemonic || mnemonic.length === 0) {
                        console.error('Decrypted mnemonic is empty');
                        return null;
                    }

                    return mnemonic;
                } catch (error) {
                    console.error('Error decrypting mnemonic:', error);
                    return null;
                }
            },

            clearWallet: () => {
                storage.remove(STORAGE_KEYS.ENCRYPTED_MNEMONIC);
                storage.remove(STORAGE_KEYS.WALLET_STATE);
                storage.remove(STORAGE_KEYS.TRANSACTIONS);

                set({
                    isAuthenticated: false,
                    hasWallet: false,
                    address: undefined,
                    balance: undefined,
                    mnemonic: undefined,
                    publicKey: undefined,
                    transactions: [],
                });
            },

            updateBalance: (balance: string) => {
                set({ balance });

                // Update stored wallet data
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const walletData = storage.get<any>(STORAGE_KEYS.WALLET_STATE);
                if (walletData) {
                    storage.set(STORAGE_KEYS.WALLET_STATE, {
                        ...walletData,
                        balance,
                    });
                }
            },

            addTransaction: (transaction: Transaction) => {
                set((state) => ({
                    transactions: [transaction, ...state.transactions],
                }));
            },
        }),
        {
            name: STORAGE_KEYS.WALLET_STATE + '_persist',
            partialize: (state) => ({
                hasWallet: state.hasWallet,
                isAuthenticated: false, // Never persist authentication
                transactions: state.transactions,
            }),
        },
    ),
);
