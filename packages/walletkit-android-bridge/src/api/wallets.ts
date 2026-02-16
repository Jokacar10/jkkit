/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Wallet management operations.
 */

import type { Hex, Network, WalletAdapter, ApiClient, Base64String, UserFriendlyAddress } from '@ton/walletkit';
import type { WalletId } from '@ton/walletkit';
import type { TransactionRequest } from '@ton/walletkit';
import type { PreparedSignData } from '@ton/walletkit';
import type { ProofMessage } from '@ton/walletkit';

import { Signer, WalletV4R2Adapter, WalletV5R1Adapter } from '../core/moduleLoader';
import { kit, wallet, getKit } from '../utils/bridge';

/**
 * Lists all wallets.
 */
export async function getWallets() {
    const wallets = (await kit('getWallets')) as { getWalletId?: () => string }[];
    return wallets.map((w) => ({ walletId: w.getWalletId?.(), wallet: w }));
}

/**
 * Get a single wallet by walletId.
 */
export async function getWalletById(args: { walletId: string }) {
    const w = await kit('getWallet', args.walletId);
    if (!w) return null;
    return { walletId: (w as { getWalletId?: () => string }).getWalletId?.(), wallet: w };
}

export async function getWalletAddress(args: { walletId: string }) {
    return wallet(args.walletId, 'getAddress');
}

export async function removeWallet(args: { walletId: string }) {
    return kit('removeWallet', args.walletId);
}

export async function getBalance(args: { walletId: string }) {
    return wallet(args.walletId, 'getBalance');
}

/**
 * Derive public key from a secret key.
 */
export async function publicKeyFromSecretKey(args: { secretKey: string }) {
    const signer = await Signer!.fromPrivateKey(args.secretKey);
    return signer.publicKey;
}

/**
 * Compute wallet address from public key + version + network. Stateless.
 * Creates a temporary adapter just to get the address, then discards it.
 */
export async function computeWalletAddress(args: {
    publicKey: string;
    version: 'v5r1' | 'v4r2';
    network: { chainId: string };
    workchain?: number;
    walletId?: number;
}) {
    const instance = await getKit();
    const network = args.network as unknown as Network;
    const dummySigner = { publicKey: args.publicKey as Hex, sign: async () => '0x' as Hex };
    const AdapterClass = args.version === 'v5r1' ? WalletV5R1Adapter : WalletV4R2Adapter;
    const adapter = await AdapterClass!.create(dummySigner, {
        client: instance.getApiClient(network),
        network,
        workchain: args.workchain ?? 0,
        walletId: args.walletId,
    });
    return adapter.getAddress();
}

/**
 * Create signer + adapter + add wallet in one stateless call.
 * For key-based signers: pass secretKey. JS creates signer from it.
 * For custom signers: pass publicKey + signerId + isCustom. JS creates a signer
 * that delegates signing back to Kotlin via WalletKitNative.signWithCustomSigner.
 */
export async function addWalletWithSigner(args: {
    secretKey?: string;
    publicKey?: string;
    signerId?: string;
    isCustom?: boolean;
    version: 'v5r1' | 'v4r2';
    network: { chainId: string };
    workchain?: number;
    walletId?: number;
}) {
    const instance = await getKit();
    const network = args.network as unknown as Network;

    let signer;
    if (args.isCustom && args.publicKey && args.signerId) {
        const signerId = args.signerId;
        signer = {
            publicKey: args.publicKey as Hex,
            sign: async (bytes: Iterable<number>): Promise<Hex> => {
                const result = await window.WalletKitNative?.signWithCustomSigner?.(signerId, Array.from(bytes));
                return result as Hex;
            },
        };
    } else if (args.secretKey) {
        signer = await Signer!.fromPrivateKey(args.secretKey);
    } else {
        throw new Error('Either secretKey or (publicKey + signerId + isCustom) required');
    }

    const AdapterClass = args.version === 'v5r1' ? WalletV5R1Adapter : WalletV4R2Adapter;
    const adapter = await AdapterClass!.create(signer, {
        client: instance.getApiClient(network),
        network,
        workchain: args.workchain ?? 0,
        walletId: args.walletId,
    });

    const w = await instance.addWallet(adapter as Parameters<typeof instance.addWallet>[0]);
    if (!w) return null;
    return { walletId: w.getWalletId?.(), wallet: w };
}

export async function addWallet(args: {
    adapterId: string;
    walletId: string;
    publicKey: string;
    network: { chainId: string };
    address: string;
}) {
    const instance = await getKit();
    const { adapterId, walletId, publicKey, address } = args;
    const network = args.network as unknown as Network;

    const proxyAdapter: WalletAdapter = {
        getPublicKey(): Hex {
            return publicKey as Hex;
        },
        getNetwork(): Network {
            return network;
        },
        getClient(): ApiClient {
            return instance.getApiClient(network);
        },
        getAddress(): UserFriendlyAddress {
            return address as UserFriendlyAddress;
        },
        getWalletId(): WalletId {
            return walletId as WalletId;
        },
        async getStateInit(): Promise<Base64String> {
            const result = await window.WalletKitNative?.adapterGetStateInit?.(adapterId);
            if (!result) throw new Error('adapterGetStateInit not available');
            return result as Base64String;
        },
        async getSignedSendTransaction(
            input: TransactionRequest,
            options?: { fakeSignature: boolean },
        ): Promise<Base64String> {
            const result = await window.WalletKitNative?.adapterSignTransaction?.(
                adapterId,
                JSON.stringify(input),
                options?.fakeSignature ?? false,
            );
            if (!result) throw new Error('adapterSignTransaction not available');
            return result as Base64String;
        },
        async getSignedSignData(
            input: PreparedSignData,
            options?: { fakeSignature: boolean },
        ): Promise<Hex> {
            const result = await window.WalletKitNative?.adapterSignData?.(
                adapterId,
                JSON.stringify(input),
                options?.fakeSignature ?? false,
            );
            if (!result) throw new Error('adapterSignData not available');
            return result as Hex;
        },
        async getSignedTonProof(
            input: ProofMessage,
            options?: { fakeSignature: boolean },
        ): Promise<Hex> {
            const result = await window.WalletKitNative?.adapterSignTonProof?.(
                adapterId,
                JSON.stringify(input),
                options?.fakeSignature ?? false,
            );
            if (!result) throw new Error('adapterSignTonProof not available');
            return result as Hex;
        },
    };

    const w = await instance.addWallet(proxyAdapter as Parameters<typeof instance.addWallet>[0]);
    if (!w) return null;
    return { walletId: w.getWalletId?.(), wallet: w };
}
