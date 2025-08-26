# Jettons Support in TonWalletKit

TonWalletKit provides comprehensive support for TON Jettons using the TonCenter API v3. This document covers all available methods, types, and usage examples.

## Overview

Jettons are TON's equivalent of ERC-20 tokens on Ethereum. Each jetton consists of:
- **Jetton Master**: The main contract containing metadata and total supply
- **Jetton Wallets**: Individual user balances for the jetton

## Enhanced API Interface

### Information & Discovery

```typescript
// === Enhanced Jettons API in TonWalletKit interface ===
jettons: {
    // === Information & Discovery ===
    /** Get jetton master info by address */
    getJettonInfo(jettonAddress: string): JettonInfo | null;
    
    /** Get all jettons for a user address */
    getAddressJettons(userAddress: string, offset?: number, limit?: number): Promise<AddressJetton[]>;
    
    /** Get user's jetton wallet address for a specific jetton */
    getJettonWalletAddress(jettonMasterAddress: string, ownerAddress: string): Promise<string>;
    
    /** Get jetton balance for a specific jetton wallet */
    getJettonBalance(jettonWalletAddress: string): Promise<JettonBalance>;
    
    // === Operations ===
    /** Prepare jetton transfer transaction */
    prepareJettonTransfer(params: JettonTransferParams): Promise<PreparedJettonTransfer>;
    
    // === History & Tracking ===
    /** Get jetton transfer history for an address */
    getJettonTransfers(ownerAddress: string, jettonAddress?: string, limit?: number): Promise<JettonTransfer[]>;
    
    /** Get detailed transaction info for jetton operation */
    getJettonTransaction(transactionHash: string): Promise<JettonTransaction | null>;
    
    // === Discovery & Search ===
    /** Search jettons by name/symbol */
    searchJettons(query: string, limit?: number): Promise<JettonInfo[]>;
    
    /** Get popular/trending jettons */
    getPopularJettons(limit?: number): Promise<JettonInfo[]>;
    
    // === Price & Market Data (if available) ===
    /** Get jetton price data */
    getJettonPrice(jettonAddress: string): Promise<JettonPrice | null>;
    
    // === Validation ===
    /** Validate jetton address format */
    validateJettonAddress(address: string): boolean;
    
    /** Check if address is a valid jetton master */
    isJettonMaster(address: string): Promise<boolean>;
}
```

## TypeScript Types

### Core Jetton Information

```typescript
// === Enhanced Jetton Information ===
export interface JettonInfo {
    address: string;
    name: string;
    symbol: string;
    description: string;
    decimals: number;
    totalSupply?: string;
    image?: string;
    uri?: string;
    verification?: JettonVerification;
    metadata?: Record<string, unknown>;
}

export interface JettonVerification {
    verified: boolean;
    source?: 'toncenter' | 'community' | 'manual';
    warnings?: string[];
}

// === User's Jetton Holdings ===
export interface AddressJetton extends JettonInfo {
    balance: string;
    jettonWalletAddress: string;
    lastActivity?: number;
    usdValue?: string; // if price data available
}

export interface JettonBalance {
    balance: string;
    jettonAddress: string;
    jettonWalletAddress: string;
    lastUpdated: number;
}
```

### Transaction Operations

```typescript
// === Transaction Operations ===
export interface JettonTransferParams {
    fromAddress: string;           // User's main address
    toAddress: string;             // Recipient address
    jettonAddress: string;         // Jetton master address
    amount: string;                // Amount in jetton units (not decimals)
    forwardAmount?: string;        // Forward TON amount
    forwardPayload?: string;       // Custom forward payload
    comment?: string;              // Transfer comment
}

export interface PreparedJettonTransfer {
    fromAddress: string;
    toAddress: string;
    jettonWalletAddress: string;
    amount: string;
    forwardAmount: string;
    boc: string;                   // Ready to sign BOC
    estimatedFees: {
        gasFee: string;
        forwardFee: string;
        storageFee: string;
        total: string;
    };
}
```

### Transaction History

```typescript
// === Transaction History ===
export interface JettonTransfer {
    hash: string;
    timestamp: number;
    from: string;
    to: string;
    jettonAddress: string;
    amount: string;
    comment?: string;
    successful: boolean;
    fees?: TransactionFees;
}

export interface JettonTransaction {
    hash: string;
    timestamp: number;
    type: 'transfer' | 'mint';
    successful: boolean;
    participants: string[];
    jettonAddress: string;
    amount?: string;
    fees: TransactionFees;
    details: JettonTransactionDetails;
}

export interface JettonTransactionDetails {
    opcode?: string;
    forwardAmount?: string;
    bounced?: boolean;
    exitCode?: number;
    rawData?: unknown; // Raw emulation data
}
```

### Market Data & Common Types

```typescript
// === Market Data ===
export interface JettonPrice {
    jettonAddress: string;
    priceUsd: string;
    priceChange24h?: string;
    volume24h?: string;
    marketCap?: string;
    lastUpdated: number;
}

// === Common Types ===
export interface TransactionFees {
    gasFee: string;
    storageFee: string;
    forwardFee?: string;
    total: string;
}

// === Error Types ===
export class JettonError extends Error {
    constructor(
        message: string,
        public code: JettonErrorCode,
        public details?: unknown
    ) {
        super(message);
        this.name = 'JettonError';
    }
}

export enum JettonErrorCode {
    INVALID_ADDRESS = 'INVALID_ADDRESS',
    JETTON_NOT_FOUND = 'JETTON_NOT_FOUND',
    INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
    NETWORK_ERROR = 'NETWORK_ERROR',
    INVALID_AMOUNT = 'INVALID_AMOUNT',
    PREPARATION_FAILED = 'PREPARATION_FAILED'
}
```

## API Reference

### Information & Discovery

#### `getJettonInfo(jettonAddress: string)`
Get basic information about a jetton.

```typescript
const jettonInfo = tonWalletKit.jettons.getJettonInfo('EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqAk');
// Returns: JettonInfo | null
```

#### `getAddressJettons(userAddress: string, offset?: number, limit?: number)`
Get all jettons held by an address.

```typescript
const userJettons = await tonWalletKit.jettons.getAddressJettons(
    'EQDGp7P6H4IBh6pUGV1fhCVXE6YL5-4w0fM6LDLrk7rqI8Ik',
    0, 
    20
);
// Returns: Promise<AddressJetton[]>
```

#### `getJettonWalletAddress(jettonMasterAddress: string, ownerAddress: string)`
Get the user's jetton wallet address for a specific jetton.

```typescript
const jettonWalletAddress = await tonWalletKit.jettons.getJettonWalletAddress(
    'EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqAk', // Jetton master
    'EQDGp7P6H4IBh6pUGV1fhCVXE6YL5-4w0fM6LDLrk7rqI8Ik'  // User address
);
// Returns: Promise<string>
```

#### `getJettonBalance(jettonWalletAddress: string)`
Get the balance for a specific jetton wallet.

```typescript
const balance = await tonWalletKit.jettons.getJettonBalance(
    'EQC1WQvg4W4iwdthd_Kp8K7mwRxwM8mE7Tb5Fh6Kdb-5bQJT'
);
// Returns: Promise<JettonBalance>
```

### Operations

#### `prepareJettonTransfer(params: JettonTransferParams)`
Prepare a jetton transfer transaction.

```typescript
const transfer = await tonWalletKit.jettons.prepareJettonTransfer({
    fromAddress: 'EQD...',
    toAddress: 'EQC...',
    jettonAddress: 'EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqAk',
    amount: '1000000000', // 1 token with 9 decimals
    comment: 'Payment for services'
});

// Then approve with regular transaction flow
await tonWalletKit.approveTransactionRequest({
    // ... event with transfer.boc
});
```

### History & Tracking

#### `getJettonTransfers(ownerAddress: string, jettonAddress?: string)`
Get transfer history for an address.

```typescript
const transfers = await tonWalletKit.jettons.getJettonTransfers(
    'EQDGp7P6H4IBh6pUGV1fhCVXE6YL5-4w0fM6LDLrk7rqI8Ik',
    'EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqAk' // Optional: filter by jetton
);
```

#### `getJettonTransaction(transactionHash: string)`
Get detailed information about a specific jetton transaction.

```typescript
const transaction = await tonWalletKit.jettons.getJettonTransaction(
    'f2b7b8f8d2e4d3c5a1b9c8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7'
);
// Returns: Promise<JettonTransaction | null>
```

### Discovery & Search

#### `searchJettons(query: string, limit?: number)`
Search for jettons by name or symbol.

```typescript
const searchResults = await tonWalletKit.jettons.searchJettons('USDT', 10);
// Returns: Promise<JettonInfo[]>
```

#### `getPopularJettons(limit?: number)`
Get a list of popular/trending jettons.

```typescript
const popularJettons = await tonWalletKit.jettons.getPopularJettons(20);
// Returns: Promise<JettonInfo[]>
```

### Validation

#### `validateJettonAddress(address: string)`
Validate if an address has correct jetton format.

```typescript
const isValid = tonWalletKit.jettons.validateJettonAddress('EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqAk');
// Returns: boolean
```

#### `isJettonMaster(address: string)`
Check if an address is a valid jetton master contract.

```typescript
const isMaster = await tonWalletKit.jettons.isJettonMaster('EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqAk');
// Returns: Promise<boolean>
```

## Integration Examples

### Basic Jetton Wallet Integration

```typescript
class JettonWallet {
    constructor(private tonWalletKit: TonWalletKit, private userAddress: string) {}

    async getBalances(): Promise<AddressJetton[]> {
        return this.tonWalletKit.jettons.getAddressJettons(this.userAddress);
    }

    async sendJetton(toAddress: string, jettonAddress: string, amount: string, comment?: string) {
        try {
            // 1. Prepare the transfer
            const prepared = await this.tonWalletKit.jettons.prepareJettonTransfer({
                fromAddress: this.userAddress,
                toAddress,
                jettonAddress,
                amount,
                comment
            });

            // 2. Create transaction request event (this would come from your UI)
            const event: EventTransactionRequest = {
                // ... create proper event structure with prepared.boc
            };

            // 3. Execute the transaction
            const result = await this.tonWalletKit.approveTransactionRequest(event);
            return result.signedBoc;
            
        } catch (error) {
            if (error instanceof JettonError) {
                switch (error.code) {
                    case JettonErrorCode.INSUFFICIENT_BALANCE:
                        throw new Error('Insufficient jetton balance');
                    case JettonErrorCode.INVALID_ADDRESS:
                        throw new Error('Invalid recipient address');
                    default:
                        throw new Error(`Jetton operation failed: ${error.message}`);
                }
            }
            throw error;
        }
    }

    async getTransferHistory(jettonAddress?: string): Promise<JettonTransfer[]> {
        return this.tonWalletKit.jettons.getJettonTransfers(this.userAddress, jettonAddress);
    }
}
```

### React Hook Example

```typescript
export function useJettonBalance(jettonAddress: string, userAddress: string) {
    const [balance, setBalance] = useState<string>('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBalance() {
            try {
                const jettons = await tonWalletKit.jettons.getAddressJettons(userAddress);
                const targetJetton = jettons.find(j => j.address === jettonAddress);
                setBalance(targetJetton?.balance ?? '0');
            } catch (error) {
                console.error('Failed to fetch jetton balance:', error);
                setBalance('0');
            } finally {
                setLoading(false);
            }
        }

        fetchBalance();
    }, [jettonAddress, userAddress]);

    return { balance, loading };
}
```

### Jetton Portfolio Component

```typescript
export function JettonPortfolio({ userAddress }: { userAddress: string }) {
    const [jettons, setJettons] = useState<AddressJetton[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadJettons() {
            try {
                const userJettons = await tonWalletKit.jettons.getAddressJettons(userAddress);
                setJettons(userJettons);
            } catch (error) {
                console.error('Failed to load jettons:', error);
            } finally {
                setLoading(false);
            }
        }

        loadJettons();
    }, [userAddress]);

    if (loading) return <div>Loading jettons...</div>;

    return (
        <div className="jetton-portfolio">
            <h3>Your Jettons</h3>
            {jettons.map(jetton => (
                <div key={jetton.address} className="jetton-item">
                    <img src={jetton.image} alt={jetton.name} />
                    <div>
                        <h4>{jetton.name} ({jetton.symbol})</h4>
                        <p>Balance: {formatBalance(jetton.balance, jetton.decimals)}</p>
                        {jetton.usdValue && <p>≈ ${jetton.usdValue}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}

function formatBalance(balance: string, decimals: number): string {
    const balanceNumber = BigInt(balance);
    const divisor = BigInt(10 ** decimals);
    const wholePart = balanceNumber / divisor;
    const fractionalPart = balanceNumber % divisor;
    
    if (fractionalPart === 0n) {
        return wholePart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    return `${wholePart}.${fractionalStr.replace(/0+$/, '')}`;
}
```

## Error Handling

All jetton operations can throw `JettonError` with specific error codes:

```typescript
try {
    await tonWalletKit.jettons.prepareJettonTransfer(params);
} catch (error) {
    if (error instanceof JettonError) {
        switch (error.code) {
            case JettonErrorCode.INVALID_ADDRESS:
                // Handle invalid address
                break;
            case JettonErrorCode.INSUFFICIENT_BALANCE:
                // Handle insufficient balance
                break;
            case JettonErrorCode.NETWORK_ERROR:
                // Handle network issues
                break;
        }
    }
}
```

## Best Practices

1. **Cache jetton info**: Use the built-in LRU cache by calling `getJettonInfo()` multiple times
2. **Validate amounts**: Always validate user input against jetton decimals
3. **Handle network errors**: Implement proper retry logic for API calls
4. **Monitor transactions**: Use the transfer history API to track transaction status
5. **Update balances**: Refresh balances after successful transactions
6. **Amount precision**: Always use `string` type for amounts to avoid precision loss
7. **Address validation**: Validate addresses before creating transactions

## TonCenter API Integration

This implementation uses TonCenter API v3 endpoints:
- `/jettons/{jetton_address}` - Get jetton information
- `/accounts/{address}/jettons` - Get account jetton balances
- `/jettons/{jetton_address}/transfers` - Get transfer history
- `/emulate` - For transaction preparation and simulation

For more details, see [TonCenter API Documentation](https://toncenter.com/api/v3/index.html#/jettons).

## Migration from Existing Implementation

If you're upgrading from the current basic jetton support:

1. **Existing methods remain unchanged**:
   - `getJettonInfo()` - Enhanced but backward compatible
   - `getAddressJettons()` - Now returns `AddressJetton[]` instead of `JettonInfo[]`

2. **New methods to implement**:
   - `prepareJettonTransfer()` - Core transfer functionality
   - `getJettonWalletAddress()` - Address calculation
   - `getJettonBalance()` - Individual balance checking

3. **Enhanced error handling**:
   - Replace generic errors with `JettonError` instances
   - Add specific error codes for better user experience

4. **Type updates**:
   - `AddressJetton` extends `JettonInfo` with balance information
   - New transaction-related types for operations
