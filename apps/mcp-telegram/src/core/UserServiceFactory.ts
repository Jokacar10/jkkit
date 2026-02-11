/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * UserServiceFactory - Creates per-user McpWalletService instances
 *
 * Wraps the shared signer/storage adapters with user-scoped wrappers
 * and creates McpWalletService instances for each user.
 */

import type { ISignerAdapter, IStorageAdapter, McpWalletServiceConfig } from '@ton/mcp';
import { McpWalletService } from '@ton/mcp';

import { UserScopedSigner } from './UserScopedSigner.js';
import { UserScopedStorage } from './UserScopedStorage.js';

export interface UserServiceFactoryConfig {
    signer: ISignerAdapter;
    storage: IStorageAdapter;
    serviceConfig: Omit<McpWalletServiceConfig, 'signer' | 'storage'>;
}

/**
 * Creates and caches per-user McpWalletService instances.
 */
export class UserServiceFactory {
    private readonly signer: ISignerAdapter;
    private readonly storage: IStorageAdapter;
    private readonly serviceConfig: Omit<McpWalletServiceConfig, 'signer' | 'storage'>;
    private readonly services = new Map<string, McpWalletService>();

    constructor(config: UserServiceFactoryConfig) {
        this.signer = config.signer;
        this.storage = config.storage;
        this.serviceConfig = config.serviceConfig;
    }

    /**
     * Get or create a McpWalletService for a specific user.
     */
    getService(userId: string): McpWalletService {
        let service = this.services.get(userId);
        if (!service) {
            const userSigner = new UserScopedSigner(this.signer, userId);
            const userStorage = new UserScopedStorage(this.storage, userId);
            service = new McpWalletService({
                ...this.serviceConfig,
                signer: userSigner,
                storage: userStorage,
            });
            this.services.set(userId, service);
        }
        return service;
    }

    /**
     * Close all cached services.
     */
    async closeAll(): Promise<void> {
        for (const service of this.services.values()) {
            await service.close();
        }
        this.services.clear();
    }
}
