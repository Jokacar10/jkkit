/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Factory function for creating configured MCP server instances
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { TonMcpConfig } from './types/config.js';
import { McpWalletService } from './services/McpWalletService.js';
import {
    createMcpWalletTools,
    createMcpBalanceTools,
    createMcpTransferTools,
    createMcpSwapTools,
    createMcpPendingTools,
} from './tools/mcp-tools.js';

const SERVER_NAME = 'ton-mcp';
const SERVER_VERSION = '0.1.0';

/**
 * Create a configured TON Wallet MCP server
 *
 * @param config - Configuration with adapters
 * @returns Configured McpServer instance
 *
 * @example
 * ```typescript
 * import { createTonWalletMCP, InMemoryStorageAdapter, LocalSignerAdapter } from '@ton/mcp';
 *
 * const server = createTonWalletMCP({
 *   storage: new InMemoryStorageAdapter(),
 *   signer: new LocalSignerAdapter(),
 * });
 * ```
 */
export function createTonWalletMCP(config: TonMcpConfig): McpServer {
    // Create wallet service
    const walletService = new McpWalletService({
        storage: config.storage,
        signer: config.signer,
        contacts: config.contacts,
        defaultNetwork: config.network,
        requireConfirmation: config.requireConfirmation,
        networks: config.networks,
    });

    // Create MCP server
    const server = new McpServer({
        name: SERVER_NAME,
        version: SERVER_VERSION,
    });

    // Get all tools
    const walletTools = createMcpWalletTools(walletService);
    const balanceTools = createMcpBalanceTools(walletService);
    const transferTools = createMcpTransferTools(walletService);
    const swapTools = createMcpSwapTools(walletService);
    const pendingTools = createMcpPendingTools(walletService);

    // Helper to register tools with type assertion (Zod version mismatch workaround)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerTool = (name: string, tool: { description: string; inputSchema: any; handler: any }) => {
        server.registerTool(name, { description: tool.description, inputSchema: tool.inputSchema }, tool.handler);
    };

    // Register wallet management tools
    registerTool('create_wallet', walletTools.create_wallet);
    registerTool('import_wallet', walletTools.import_wallet);
    registerTool('list_wallets', walletTools.list_wallets);
    registerTool('remove_wallet', walletTools.remove_wallet);

    // Register balance tools
    registerTool('get_balance', balanceTools.get_balance);
    registerTool('get_jetton_balance', balanceTools.get_jetton_balance);
    registerTool('get_jettons', balanceTools.get_jettons);
    registerTool('get_transactions', balanceTools.get_transactions);

    // Register transfer tools
    registerTool('send_ton', transferTools.send_ton);
    registerTool('send_jetton', transferTools.send_jetton);

    // Register swap tools
    registerTool('get_swap_quote', swapTools.get_swap_quote);
    registerTool('execute_swap', swapTools.execute_swap);

    // Register pending transaction tools (only if confirmation is enabled)
    if (config.requireConfirmation) {
        registerTool('confirm_transaction', pendingTools.confirm_transaction);
        registerTool('cancel_transaction', pendingTools.cancel_transaction);
        registerTool('list_pending_transactions', pendingTools.list_pending_transactions);
    }

    return server;
}

/**
 * Get the wallet service shutdown handler
 * Call this to properly cleanup when shutting down
 */
export function createShutdownHandler(walletService: McpWalletService): () => Promise<void> {
    return () => walletService.close();
}
