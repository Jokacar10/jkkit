/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * TON MCP Server - Model Context Protocol server for TON blockchain wallet operations
 *
 * This module provides:
 * - Factory function for creating single-user MCP servers with pluggable adapters
 * - Adapter interfaces for custom storage and signing implementations
 * - Built-in adapters for common use cases
 */

// ===========================================
// Factory and Configuration
// ===========================================

export { createTonWalletMCP } from './factory.js';

// ===========================================
// Type Exports (for implementers)
// ===========================================

export type {
    IStorageAdapter,
    ISignerAdapter,
    WalletInfo,
    CreateWalletParams,
    ImportWalletParams,
    IContactResolver,
    Contact,
    TonMcpConfig,
} from './types/index.js';

// ===========================================
// Adapters
// ===========================================

export {
    InMemoryStorageAdapter,
    LocalSignerAdapter,
    SqliteStorageAdapter,
    SqliteSignerAdapter,
} from './adapters/index.js';

export type { SqliteDatabase, SqliteStorageConfig, SqliteSignerConfig } from './adapters/index.js';

// ===========================================
// Services
// ===========================================

export { McpWalletService } from './services/McpWalletService.js';
export type {
    McpWalletInfo,
    McpWalletServiceConfig,
    NetworkConfig,
    CreateWalletResult,
    ImportWalletResult,
    JettonInfoResult,
    TransferResult,
    SwapQuoteResult,
    SwapResult,
    PendingTransaction,
} from './services/McpWalletService.js';
