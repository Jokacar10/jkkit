// Storage adapter implementations

import type { StorageAdapter, StorageConfig } from './types';
import { globalLogger } from '../core/Logger';

const log = globalLogger.createChild('StorageAdapter');

/**
 * localStorage adapter for web environments
 */
export class LocalStorageAdapter implements StorageAdapter {
    private prefix: string;
    private maxRetries: number;
    private retryDelay: number;

    constructor(config: StorageConfig = {}) {
        this.prefix = config.prefix || 'tonwallet:';
        this.maxRetries = config.maxRetries || 3;
        this.retryDelay = config.retryDelay || 100;

        this.validateEnvironment();
    }

    async get<T>(key: string): Promise<T | null> {
        return this.withRetry(async () => {
            const fullKey = this.prefix + key;
            const item = localStorage.getItem(fullKey);
            return item ? JSON.parse(item) : null;
        });
    }

    async set<T>(key: string, value: T): Promise<void> {
        return this.withRetry(async () => {
            const fullKey = this.prefix + key;
            localStorage.setItem(fullKey, JSON.stringify(value));
        });
    }

    async remove(key: string): Promise<void> {
        return this.withRetry(async () => {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
        });
    }

    async clear(): Promise<void> {
        return this.withRetry(async () => {
            const keysToRemove = this.getPrefixedKeys();
            keysToRemove.forEach((key) => localStorage.removeItem(key));
        });
    }

    private validateEnvironment(): void {
        if (typeof localStorage === 'undefined') {
            throw new Error('localStorage is not available in this environment');
        }
    }

    private getPrefixedKeys(): string[] {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keys.push(key);
            }
        }
        return keys;
    }

    private async withRetry<T>(operation: () => T): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay * Math.pow(2, attempt));
                }
            }
        }

        throw lastError;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

/**
 * In-memory storage adapter for testing and temporary storage
 */
export class MemoryStorageAdapter implements StorageAdapter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private store: Map<string, any> = new Map();
    private prefix: string;

    constructor(config: StorageConfig = {}) {
        this.prefix = config.prefix || '';
    }

    async get<T>(key: string): Promise<T | null> {
        const fullKey = this.prefix + key;
        return this.store.get(fullKey) || null;
    }

    async set<T>(key: string, value: T): Promise<void> {
        const fullKey = this.prefix + key;
        this.store.set(fullKey, value);
    }

    async remove(key: string): Promise<void> {
        const fullKey = this.prefix + key;
        this.store.delete(fullKey);
    }

    async clear(): Promise<void> {
        if (this.prefix) {
            // Clear only prefixed keys
            const keysToDelete = Array.from(this.store.keys()).filter((key) => key.startsWith(this.prefix));
            keysToDelete.forEach((key) => this.store.delete(key));
        } else {
            // Clear all keys
            this.store.clear();
        }
    }

    /**
     * Get current store size (for testing/debugging)
     */
    getSize(): number {
        return this.store.size;
    }

    /**
     * Get all keys (for testing/debugging)
     */
    getKeys(): string[] {
        return Array.from(this.store.keys());
    }
}

/**
 * Create storage adapter based on environment and preferences
 */
export function createStorageAdapter(config: StorageConfig = {}): StorageAdapter {
    // Check if localStorage is available
    if (typeof localStorage !== 'undefined') {
        try {
            return new LocalStorageAdapter(config);
        } catch (error) {
            log.warn('Failed to create LocalStorageAdapter, falling back to memory', { error });
        }
    }

    // Fallback to memory storage
    log.warn('Using MemoryStorageAdapter - data will not persist across sessions');
    return new MemoryStorageAdapter(config);
}
