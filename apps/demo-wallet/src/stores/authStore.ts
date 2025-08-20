import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { storage, STORAGE_KEYS, SimpleEncryption } from '../utils';
import type { AuthState } from '../types/wallet';

interface AuthStore extends AuthState {
    // Actions
    setPassword: (password: string) => Promise<void>;
    unlock: (password: string) => Promise<boolean>;
    lock: () => void;
    reset: () => void;

    // Internal state
    currentPassword?: string;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial state
            isPasswordSet: false,
            isUnlocked: false,

            // Actions
            setPassword: async (password: string) => {
                try {
                    // Create a simple hash for password verification
                    const passwordHash = await crypto.subtle.digest(
                        'SHA-256',
                        new TextEncoder().encode(password + 'wallet_salt'),
                    );

                    storage.set(STORAGE_KEYS.PASSWORD_HASH, Array.from(new Uint8Array(passwordHash)));

                    set({
                        isPasswordSet: true,
                        isUnlocked: true,
                        currentPassword: password,
                    });
                } catch (error) {
                    console.error('Error setting password:', error);
                    throw new Error('Failed to set password');
                }
            },

            unlock: async (password: string) => {
                try {
                    const storedHash = storage.get<number[]>(STORAGE_KEYS.PASSWORD_HASH);
                    if (!storedHash) return false;

                    // Verify password
                    const passwordHash = await crypto.subtle.digest(
                        'SHA-256',
                        new TextEncoder().encode(password + 'wallet_salt'),
                    );

                    const currentHash = Array.from(new Uint8Array(passwordHash));
                    const isValid = storedHash.every((byte, index) => byte === currentHash[index]);

                    if (isValid) {
                        set({
                            isUnlocked: true,
                            currentPassword: password,
                        });
                        return true;
                    }

                    return false;
                } catch (error) {
                    console.error('Error unlocking wallet:', error);
                    return false;
                }
            },

            lock: () => {
                set({
                    isUnlocked: false,
                    currentPassword: undefined,
                });
            },

            reset: () => {
                storage.remove(STORAGE_KEYS.PASSWORD_HASH);
                storage.remove(STORAGE_KEYS.ENCRYPTED_MNEMONIC);
                storage.remove(STORAGE_KEYS.WALLET_STATE);
                set({
                    isPasswordSet: false,
                    isUnlocked: false,
                    currentPassword: undefined,
                });
            },
        }),
        {
            name: STORAGE_KEYS.AUTH_STATE,
            partialize: (state) => ({
                isPasswordSet: state.isPasswordSet,
                isUnlocked: false, // Never persist unlocked state
            }),
        },
    ),
);
