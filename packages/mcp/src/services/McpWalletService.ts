/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * McpWalletService - Single-user wallet service for MCP server
 *
 * This service wraps wallet operations using pluggable adapters:
 * - ISignerAdapter for key management and signing
 * - IStorageAdapter for metadata and pending transactions
 * - Optional confirmation flow for transactions
 *
 * Designed for single-user MCP deployments (e.g., Claude Desktop).
 * For multi-user scenarios (e.g., Telegram bots), build your own
 * user-scoping layer on top.
 */

import {
    TonWalletKit,
    Signer,
    WalletV5R1Adapter,
    WalletV4R2Adapter,
    MemoryStorageAdapter,
    Network,
    createWalletId,
} from '@ton/walletkit';
import type { Wallet, SwapQuote, SwapQuoteParams, SwapParams, ApiClientConfig } from '@ton/walletkit';
import { OmnistonSwapProvider } from '@ton/walletkit/swap/omniston';

import type { IStorageAdapter } from '../types/storage.js';
import type { ISignerAdapter } from '../types/signer.js';
import type { IContactResolver } from '../types/contacts.js';

/**
 * Wallet info returned to tools (no sensitive data)
 */
export interface McpWalletInfo {
    name: string;
    address: string;
    network: 'mainnet' | 'testnet';
    version: 'v5r1' | 'v4r2';
    createdAt: string;
}

/**
 * Result of creating a wallet (no mnemonic!)
 */
export interface CreateWalletResult {
    name: string;
    address: string;
    network: 'mainnet' | 'testnet';
}

/**
 * Result of importing a wallet
 */
export interface ImportWalletResult {
    name: string;
    address: string;
    network: 'mainnet' | 'testnet';
}

/**
 * Jetton information
 */
export interface JettonInfoResult {
    address: string;
    balance: string;
    name?: string;
    symbol?: string;
    decimals?: number;
}

/**
 * Transaction info (from events API)
 */
export interface TransactionInfo {
    eventId: string;
    timestamp: number;
    type:
        | 'TonTransfer'
        | 'JettonTransfer'
        | 'JettonSwap'
        | 'NftItemTransfer'
        | 'ContractDeploy'
        | 'SmartContractExec'
        | 'Unknown';
    status: 'success' | 'failure';
    // For TON transfers
    from?: string;
    to?: string;
    amount?: string;
    comment?: string;
    // For Jetton transfers
    jettonAddress?: string;
    jettonSymbol?: string;
    jettonAmount?: string;
    // For swaps
    dex?: string;
    amountIn?: string;
    amountOut?: string;
    // General
    description?: string;
    isScam: boolean;
}

/**
 * Transfer result
 */
export interface TransferResult {
    success: boolean;
    message: string;
    pendingTransactionId?: string;
}

/**
 * Swap quote result
 */
export interface SwapQuoteResult {
    quote: SwapQuote;
    fromToken: string;
    toToken: string;
    fromAmount: string;
    toAmount: string;
    minReceived: string;
    provider: string;
    expiresAt?: number;
}

/**
 * Swap result
 */
export interface SwapResult {
    success: boolean;
    message: string;
    pendingTransactionId?: string;
}

/**
 * Network configuration with optional API key
 */
export interface NetworkConfig {
    /** TonCenter API key for this network */
    apiKey?: string;
}

/**
 * Pending transaction types
 */
type PendingTransactionType = 'send_ton' | 'send_jetton' | 'swap';

/**
 * Pending transaction data
 */
export interface PendingTransaction {
    id: string;
    type: PendingTransactionType;
    walletName: string;
    createdAt: string;
    expiresAt: string;
    description: string;
    data: PendingTonTransfer | PendingJettonTransfer | PendingSwap;
}

interface PendingTonTransfer {
    type: 'send_ton';
    toAddress: string;
    amountNano: string;
    amountTon: string;
    comment?: string;
}

interface PendingJettonTransfer {
    type: 'send_jetton';
    toAddress: string;
    jettonAddress: string;
    amountRaw: string;
    amountHuman: string;
    symbol?: string;
    decimals: number;
    comment?: string;
}

interface PendingSwap {
    type: 'swap';
    fromToken: string;
    toToken: string;
    fromAmount: string;
    toAmount: string;
    minReceived: string;
    provider: string;
    quoteJson: string;
}

/** Default pending transaction TTL in seconds (5 minutes) */
const PENDING_TTL_SECONDS = 300;

/**
 * Configuration for McpWalletService
 */
export interface McpWalletServiceConfig {
    storage: IStorageAdapter;
    signer: ISignerAdapter;
    contacts?: IContactResolver;
    defaultNetwork?: 'mainnet' | 'testnet';
    requireConfirmation?: boolean;
    /** Network-specific configuration */
    networks?: {
        mainnet?: NetworkConfig;
        testnet?: NetworkConfig;
    };
}

/**
 * McpWalletService manages wallet operations for single-user MCP deployments.
 */
export class McpWalletService {
    private readonly config: McpWalletServiceConfig;
    private readonly signer: ISignerAdapter;
    private readonly storage: IStorageAdapter;
    private kit: TonWalletKit | null = null;
    private loadedWallets: Map<string, Wallet> = new Map();

    constructor(config: McpWalletServiceConfig) {
        this.config = config;
        this.signer = config.signer;
        this.storage = config.storage;
    }

    /**
     * Get Network instance from network name
     */
    private getNetwork(networkName: 'mainnet' | 'testnet'): Network {
        return networkName === 'mainnet' ? Network.mainnet() : Network.testnet();
    }

    /**
     * Initialize TonWalletKit
     */
    private async getKit(): Promise<TonWalletKit> {
        if (!this.kit) {
            // Build network config with optional API keys
            const mainnetConfig: ApiClientConfig = {};
            const testnetConfig: ApiClientConfig = {};

            if (this.config.networks?.mainnet?.apiKey) {
                mainnetConfig.url = 'https://toncenter.com';
                mainnetConfig.key = this.config.networks.mainnet.apiKey;
            }
            if (this.config.networks?.testnet?.apiKey) {
                testnetConfig.url = 'https://testnet.toncenter.com';
                testnetConfig.key = this.config.networks.testnet.apiKey;
            }

            this.kit = new TonWalletKit({
                networks: {
                    [Network.mainnet().chainId]: { apiClient: mainnetConfig },
                    [Network.testnet().chainId]: { apiClient: testnetConfig },
                },
                storage: new MemoryStorageAdapter(),
            });
            await this.kit.waitForReady();

            // Register Omniston swap provider
            const omnistonProvider = new OmnistonSwapProvider({
                defaultSlippageBps: 100,
            });
            this.kit.swap.registerProvider(omnistonProvider);
        }
        return this.kit;
    }

    /**
     * Check if confirmation is required
     */
    requiresConfirmation(): boolean {
        return this.config.requireConfirmation ?? false;
    }

    /**
     * Create a new wallet
     */
    async createWallet(
        name: string,
        version: 'v5r1' | 'v4r2' = 'v5r1',
        networkName: 'mainnet' | 'testnet' = this.config.defaultNetwork ?? 'mainnet',
    ): Promise<CreateWalletResult> {
        const walletInfo = await this.signer.createWallet({
            walletId: name,
            version,
            network: networkName,
        });

        // Store metadata
        const metadata: McpWalletInfo = {
            name,
            address: walletInfo.address,
            network: walletInfo.network,
            version: walletInfo.version,
            createdAt: walletInfo.createdAt,
        };
        await this.storage.set(`wallet:${name}`, metadata);

        return {
            name,
            address: walletInfo.address,
            network: walletInfo.network,
        };
    }

    /**
     * Import a wallet from mnemonic
     */
    async importWallet(
        name: string,
        mnemonic: string[],
        version: 'v5r1' | 'v4r2' = 'v5r1',
        networkName: 'mainnet' | 'testnet' = this.config.defaultNetwork ?? 'mainnet',
    ): Promise<ImportWalletResult> {
        const walletInfo = await this.signer.importWallet({
            walletId: name,
            mnemonic,
            version,
            network: networkName,
        });

        // Store metadata
        const metadata: McpWalletInfo = {
            name,
            address: walletInfo.address,
            network: walletInfo.network,
            version: walletInfo.version,
            createdAt: walletInfo.createdAt,
        };
        await this.storage.set(`wallet:${name}`, metadata);

        return {
            name,
            address: walletInfo.address,
            network: walletInfo.network,
        };
    }

    /**
     * List all wallets
     */
    async listWallets(): Promise<McpWalletInfo[]> {
        const walletIds = await this.signer.listWalletIds();
        const wallets: McpWalletInfo[] = [];

        for (const walletId of walletIds) {
            const wallet = await this.signer.getWallet(walletId);
            if (wallet) {
                wallets.push({
                    name: walletId,
                    address: wallet.address,
                    network: wallet.network,
                    version: wallet.version,
                    createdAt: wallet.createdAt,
                });
            }
        }

        return wallets;
    }

    /**
     * Remove a wallet
     */
    async removeWallet(name: string): Promise<boolean> {
        const deleted = await this.signer.deleteWallet(name);
        if (deleted) {
            await this.storage.delete(`wallet:${name}`);
        }
        return deleted;
    }

    /**
     * Get or load a wallet for balance/transfer operations
     */
    private async getWalletForOperations(name: string): Promise<Wallet> {
        const walletInfo = await this.signer.getWallet(name);
        if (!walletInfo) {
            throw new Error('Wallet not found');
        }

        const network = this.getNetwork(walletInfo.network);
        const walletId = createWalletId(network, walletInfo.address);

        // Check cache
        if (this.loadedWallets.has(walletId)) {
            return this.loadedWallets.get(walletId)!;
        }

        // Try to get loaded wallet from signer
        const signer = this.signer as {
            getLoadedWallet?(walletId: string): Promise<Wallet>;
            getStoredWallet?(walletId: string):
                | {
                      mnemonic: string[];
                      version: 'v5r1' | 'v4r2';
                  }
                | undefined;
        };

        if (typeof signer.getLoadedWallet === 'function') {
            const wallet = await signer.getLoadedWallet(name);
            this.loadedWallets.set(walletId, wallet);
            return wallet;
        }

        // Fallback: reconstruct the wallet from stored mnemonic
        if (typeof signer.getStoredWallet === 'function') {
            const storedWallet = signer.getStoredWallet(name);
            if (storedWallet) {
                const kit = await this.getKit();
                const signerInstance = await Signer.fromMnemonic(storedWallet.mnemonic, { type: 'ton' });

                const walletAdapter =
                    storedWallet.version === 'v5r1'
                        ? await WalletV5R1Adapter.create(signerInstance, {
                              client: kit.getApiClient(network),
                              network,
                          })
                        : await WalletV4R2Adapter.create(signerInstance, {
                              client: kit.getApiClient(network),
                              network,
                          });

                let wallet = await kit.addWallet(walletAdapter);
                if (!wallet) {
                    wallet = kit.getWallet(walletId);
                }
                if (!wallet) {
                    throw new Error('Failed to load wallet');
                }

                this.loadedWallets.set(walletId, wallet);
                return wallet;
            }
        }

        throw new Error('Unable to load wallet for operations');
    }

    /**
     * Get TON balance
     */
    async getBalance(walletName: string): Promise<string> {
        const wallet = await this.getWalletForOperations(walletName);
        return wallet.getBalance();
    }

    /**
     * Get Jetton balance
     */
    async getJettonBalance(walletName: string, jettonAddress: string): Promise<string> {
        const wallet = await this.getWalletForOperations(walletName);
        return wallet.getJettonBalance(jettonAddress);
    }

    /**
     * Get all Jettons
     */
    async getJettons(walletName: string): Promise<JettonInfoResult[]> {
        const wallet = await this.getWalletForOperations(walletName);
        const jettonsResponse = await wallet.getJettons({ pagination: { limit: 100, offset: 0 } });

        return jettonsResponse.jettons.map((j) => ({
            address: j.address,
            balance: j.balance,
            name: j.info.name,
            symbol: j.info.symbol,
            decimals: j.decimalsNumber,
        }));
    }

    /**
     * Get transaction history using events API
     */
    async getTransactions(walletName: string, limit: number = 20): Promise<TransactionInfo[]> {
        const wallet = await this.getWalletForOperations(walletName);
        const address = wallet.getAddress();
        const client = wallet.getClient();

        const response = await client.getEvents({
            account: address,
            limit,
        });

        const results: TransactionInfo[] = [];

        for (const event of response.events) {
            for (const action of event.actions) {
                const info: TransactionInfo = {
                    eventId: event.eventId,
                    timestamp: event.timestamp,
                    type: 'Unknown',
                    status: action.status === 'success' ? 'success' : 'failure',
                    description: action.simplePreview?.description,
                    isScam: event.isScam,
                };

                if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
                    const transfer = (
                        action as {
                            TonTransfer: {
                                sender: { address: string };
                                recipient: { address: string };
                                amount: bigint;
                                comment?: string;
                            };
                        }
                    ).TonTransfer;
                    info.type = 'TonTransfer';
                    info.from = transfer.sender?.address;
                    info.to = transfer.recipient?.address;
                    info.amount = transfer.amount?.toString();
                    info.comment = transfer.comment;
                } else if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
                    const transfer = (
                        action as {
                            JettonTransfer: {
                                sender: { address: string };
                                recipient: { address: string };
                                amount: bigint;
                                comment?: string;
                                jetton: { address: string; symbol: string };
                            };
                        }
                    ).JettonTransfer;
                    info.type = 'JettonTransfer';
                    info.from = transfer.sender?.address;
                    info.to = transfer.recipient?.address;
                    info.jettonAmount = transfer.amount?.toString();
                    info.jettonAddress = transfer.jetton?.address;
                    info.jettonSymbol = transfer.jetton?.symbol;
                    info.comment = transfer.comment;
                } else if (action.type === 'JettonSwap' && 'JettonSwap' in action) {
                    const swap = (
                        action as {
                            JettonSwap: {
                                dex: string;
                                amountIn: string;
                                amountOut: string;
                                jettonMasterOut: { symbol: string };
                            };
                        }
                    ).JettonSwap;
                    info.type = 'JettonSwap';
                    info.dex = swap.dex;
                    info.amountIn = swap.amountIn;
                    info.amountOut = swap.amountOut;
                    info.jettonSymbol = swap.jettonMasterOut?.symbol;
                } else if (action.type === 'NftItemTransfer') {
                    info.type = 'NftItemTransfer';
                } else if (action.type === 'ContractDeploy') {
                    info.type = 'ContractDeploy';
                } else if (action.type === 'SmartContractExec') {
                    info.type = 'SmartContractExec';
                }

                results.push(info);
            }
        }

        return results;
    }

    /**
     * Send TON (with optional confirmation flow)
     */
    async sendTon(
        walletName: string,
        toAddress: string,
        amountNano: string,
        amountTon: string,
        comment?: string,
    ): Promise<TransferResult> {
        // If confirmation required, create pending transaction
        if (this.requiresConfirmation()) {
            const pending = await this.createPending({
                type: 'send_ton',
                walletName,
                description: `Send ${amountTon} TON to ${toAddress}${comment ? ` (${comment})` : ''}`,
                data: {
                    type: 'send_ton',
                    toAddress,
                    amountNano,
                    amountTon,
                    comment,
                } as PendingTonTransfer,
            });

            return {
                success: true,
                message: `Transaction pending confirmation. ID: ${pending.id}`,
                pendingTransactionId: pending.id,
            };
        }

        // Execute immediately
        return this.executeTonTransfer(walletName, toAddress, amountNano, comment);
    }

    /**
     * Execute TON transfer (internal)
     */
    private async executeTonTransfer(
        walletName: string,
        toAddress: string,
        amountNano: string,
        comment?: string,
    ): Promise<TransferResult> {
        try {
            const wallet = await this.getWalletForOperations(walletName);

            const tx = await wallet.createTransferTonTransaction({
                recipientAddress: toAddress,
                transferAmount: amountNano,
                comment,
            });

            await wallet.sendTransaction(tx);

            return {
                success: true,
                message: `Successfully sent ${amountNano} nanoTON to ${toAddress}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Send Jetton (with optional confirmation flow)
     */
    async sendJetton(
        walletName: string,
        toAddress: string,
        jettonAddress: string,
        amountRaw: string,
        amountHuman: string,
        symbol: string | undefined,
        decimals: number,
        comment?: string,
    ): Promise<TransferResult> {
        // If confirmation required, create pending transaction
        if (this.requiresConfirmation()) {
            const pending = await this.createPending({
                type: 'send_jetton',
                walletName,
                description: `Send ${amountHuman} ${symbol ?? 'tokens'} to ${toAddress}${comment ? ` (${comment})` : ''}`,
                data: {
                    type: 'send_jetton',
                    toAddress,
                    jettonAddress,
                    amountRaw,
                    amountHuman,
                    symbol,
                    decimals,
                    comment,
                } as PendingJettonTransfer,
            });

            return {
                success: true,
                message: `Transaction pending confirmation. ID: ${pending.id}`,
                pendingTransactionId: pending.id,
            };
        }

        // Execute immediately
        return this.executeJettonTransfer(walletName, toAddress, jettonAddress, amountRaw, comment);
    }

    /**
     * Execute Jetton transfer (internal)
     */
    private async executeJettonTransfer(
        walletName: string,
        toAddress: string,
        jettonAddress: string,
        amountRaw: string,
        comment?: string,
    ): Promise<TransferResult> {
        try {
            const wallet = await this.getWalletForOperations(walletName);

            const tx = await wallet.createTransferJettonTransaction({
                recipientAddress: toAddress,
                jettonAddress,
                transferAmount: amountRaw,
                comment,
            });

            await wallet.sendTransaction(tx);

            return {
                success: true,
                message: `Successfully sent jettons to ${toAddress}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Get swap quote
     */
    async getSwapQuote(
        walletName: string,
        fromToken: string,
        toToken: string,
        amount: string,
        slippageBps?: number,
    ): Promise<SwapQuoteResult> {
        const walletInfo = await this.signer.getWallet(walletName);
        if (!walletInfo) {
            throw new Error('Wallet not found');
        }

        const network = this.getNetwork(walletInfo.network);
        const kit = await this.getKit();

        const params: SwapQuoteParams = {
            fromToken: fromToken === 'TON' ? { type: 'ton' } : { type: 'jetton', value: fromToken },
            toToken: toToken === 'TON' ? { type: 'ton' } : { type: 'jetton', value: toToken },
            amount: amount,
            network,
            slippageBps,
        };

        const quote = await kit.swap.getQuote(params);

        return {
            quote,
            fromToken: quote.fromToken.type === 'ton' ? 'TON' : quote.fromToken.value,
            toToken: quote.toToken.type === 'ton' ? 'TON' : quote.toToken.value,
            fromAmount: quote.fromAmount,
            toAmount: quote.toAmount,
            minReceived: quote.minReceived,
            provider: quote.providerId,
            expiresAt: quote.expiresAt,
        };
    }

    /**
     * Execute swap (with optional confirmation flow)
     */
    async executeSwap(walletName: string, quote: SwapQuote): Promise<SwapResult> {
        // If confirmation required, create pending transaction
        if (this.requiresConfirmation()) {
            const pending = await this.createPending({
                type: 'swap',
                walletName,
                description: `Swap ${quote.fromAmount} ${quote.fromToken} for ${quote.toAmount} ${quote.toToken}`,
                data: {
                    type: 'swap',
                    fromToken: String(quote.fromToken),
                    toToken: String(quote.toToken),
                    fromAmount: quote.fromAmount,
                    toAmount: quote.toAmount,
                    minReceived: quote.minReceived,
                    provider: quote.providerId,
                    quoteJson: JSON.stringify(quote),
                } as PendingSwap,
            });

            return {
                success: true,
                message: `Swap pending confirmation. ID: ${pending.id}`,
                pendingTransactionId: pending.id,
            };
        }

        // Execute immediately
        return this.executeSwapInternal(walletName, quote);
    }

    /**
     * Execute swap (internal)
     */
    private async executeSwapInternal(walletName: string, quote: SwapQuote): Promise<SwapResult> {
        try {
            const walletInfo = await this.signer.getWallet(walletName);
            if (!walletInfo) {
                throw new Error('Wallet not found');
            }

            const [wallet, kit] = await Promise.all([this.getWalletForOperations(walletName), this.getKit()]);

            const params: SwapParams = {
                quote,
                userAddress: walletInfo.address,
            };

            const tx = await kit.swap.buildSwapTransaction(params);
            await wallet.sendTransaction(tx);

            return {
                success: true,
                message: `Successfully swapped ${quote.fromAmount} ${quote.fromToken} for ${quote.toAmount} ${quote.toToken}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Confirm a pending transaction
     */
    async confirmTransaction(transactionId: string): Promise<TransferResult | SwapResult> {
        const pending = await this.confirmPending(transactionId);
        if (!pending) {
            return { success: false, message: 'Transaction not found or expired' };
        }

        switch (pending.data.type) {
            case 'send_ton': {
                const data = pending.data as PendingTonTransfer;
                return this.executeTonTransfer(pending.walletName, data.toAddress, data.amountNano, data.comment);
            }
            case 'send_jetton': {
                const data = pending.data as PendingJettonTransfer;
                return this.executeJettonTransfer(
                    pending.walletName,
                    data.toAddress,
                    data.jettonAddress,
                    data.amountRaw,
                    data.comment,
                );
            }
            case 'swap': {
                const data = pending.data as PendingSwap;
                const quote = JSON.parse(data.quoteJson) as SwapQuote;
                return this.executeSwapInternal(pending.walletName, quote);
            }
            default:
                return { success: false, message: 'Unknown transaction type' };
        }
    }

    /**
     * Cancel a pending transaction
     */
    async cancelTransaction(transactionId: string): Promise<boolean> {
        const pending = await this.getPending(transactionId);
        if (!pending) {
            return false;
        }
        return this.storage.delete(`pending:${transactionId}`);
    }

    /**
     * List pending transactions
     */
    async listPendingTransactions(): Promise<PendingTransaction[]> {
        const keys = await this.storage.list('pending:');
        const now = new Date();
        const transactions: PendingTransaction[] = [];

        for (const key of keys) {
            const pending = await this.storage.get<PendingTransaction>(key);
            if (pending && new Date(pending.expiresAt) >= now) {
                transactions.push(pending);
            }
        }

        return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    /**
     * Resolve contact name to address
     */
    async resolveContact(name: string): Promise<string | null> {
        if (!this.config.contacts) {
            return null;
        }
        return this.config.contacts.resolve('default', name);
    }

    /**
     * Close and cleanup
     */
    async close(): Promise<void> {
        if (this.kit) {
            await this.kit.close();
            this.kit = null;
        }
        this.loadedWallets.clear();
    }

    // ============================================
    // Pending transaction helpers (internal)
    // ============================================

    private async createPending(params: {
        type: PendingTransactionType;
        walletName: string;
        description: string;
        data: PendingTonTransfer | PendingJettonTransfer | PendingSwap;
    }): Promise<PendingTransaction> {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + PENDING_TTL_SECONDS * 1000);

        const pending: PendingTransaction = {
            id,
            type: params.type,
            walletName: params.walletName,
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            description: params.description,
            data: params.data,
        };

        await this.storage.set(`pending:${id}`, pending, PENDING_TTL_SECONDS);
        return pending;
    }

    private async getPending(transactionId: string): Promise<PendingTransaction | null> {
        const pending = await this.storage.get<PendingTransaction>(`pending:${transactionId}`);
        if (!pending) {
            return null;
        }
        if (new Date(pending.expiresAt) < new Date()) {
            await this.storage.delete(`pending:${transactionId}`);
            return null;
        }
        return pending;
    }

    private async confirmPending(transactionId: string): Promise<PendingTransaction | null> {
        const pending = await this.getPending(transactionId);
        if (!pending) {
            return null;
        }
        await this.storage.delete(`pending:${transactionId}`);
        return pending;
    }
}
