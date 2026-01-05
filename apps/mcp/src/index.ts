#!/usr/bin/env node

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
 * This server provides tools for:
 * - Creating and importing TON wallets
 * - Checking TON and Jetton balances
 * - Sending TON and Jettons
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { WalletService } from './services/WalletService.js';
import { createWalletTools, createBalanceTools, createTransferTools } from './tools/index.js';

const SERVER_NAME = 'ton-mcp';
const SERVER_VERSION = '0.1.0';

async function main() {
    // Initialize wallet service (mainnet by default)
    const walletService = new WalletService('mainnet');

    // Create MCP server
    const server = new McpServer({
        name: SERVER_NAME,
        version: SERVER_VERSION,
    });

    // Get all tools
    const walletTools = createWalletTools(walletService);
    const balanceTools = createBalanceTools(walletService);
    const transferTools = createTransferTools(walletService);

    // Register wallet management tools
    server.tool(
        'create_wallet',
        walletTools.create_wallet.description,
        walletTools.create_wallet.inputSchema.shape,
        walletTools.create_wallet.handler,
    );

    server.tool(
        'import_wallet',
        walletTools.import_wallet.description,
        walletTools.import_wallet.inputSchema.shape,
        walletTools.import_wallet.handler,
    );

    server.tool(
        'list_wallets',
        walletTools.list_wallets.description,
        walletTools.list_wallets.inputSchema.shape,
        walletTools.list_wallets.handler,
    );

    server.tool(
        'remove_wallet',
        walletTools.remove_wallet.description,
        walletTools.remove_wallet.inputSchema.shape,
        walletTools.remove_wallet.handler,
    );

    // Register balance tools
    server.tool(
        'get_balance',
        balanceTools.get_balance.description,
        balanceTools.get_balance.inputSchema.shape,
        balanceTools.get_balance.handler,
    );

    server.tool(
        'get_jetton_balance',
        balanceTools.get_jetton_balance.description,
        balanceTools.get_jetton_balance.inputSchema.shape,
        balanceTools.get_jetton_balance.handler,
    );

    server.tool(
        'get_jettons',
        balanceTools.get_jettons.description,
        balanceTools.get_jettons.inputSchema.shape,
        balanceTools.get_jettons.handler,
    );

    // Register transfer tools
    server.tool(
        'send_ton',
        transferTools.send_ton.description,
        transferTools.send_ton.inputSchema.shape,
        transferTools.send_ton.handler,
    );

    server.tool(
        'send_jetton',
        transferTools.send_jetton.description,
        transferTools.send_jetton.inputSchema.shape,
        transferTools.send_jetton.handler,
    );

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        await walletService.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        await walletService.close();
        process.exit(0);
    });

    // Connect server to transport
    await server.connect(transport);
}

main().catch(() => {
    process.exit(1);
});
