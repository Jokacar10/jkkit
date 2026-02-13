# @ton/mcp - TON MCP Server

A Model Context Protocol (MCP) server for TON blockchain wallet operations. Built on top of `@ton/walletkit`.

## Features

- **Balance Queries**: Check TON and Jetton balances, list all tokens
- **Transaction History**: View recent transactions with detailed info
- **Transfers**: Send TON, Jettons, and NFTs
- **Swaps**: Get quotes and execute token swaps via DEX
- **NFT Support**: List, view details, and transfer NFTs
- **DNS Resolution**: Resolve .ton domains and reverse lookup addresses
- **Dual Transport**: Stdio (default) and HTTP server modes
- **Serverless Support**: Deploy to AWS Lambda, Vercel, etc.

## Quick Start

```bash
# Run with mnemonic (full control)
MNEMONIC="word1 word2 ... word24" npx @ton/mcp

# Run as HTTP server
MNEMONIC="word1 word2 ... word24" npx @ton/mcp --http

# Run on custom port and host
MNEMONIC="word1 word2 ... word24" npx @ton/mcp --http 8080 --host 127.0.0.1
```

## Usage with MCP Clients

### Claude Desktop / Cursor

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "ton": {
      "command": "npx",
      "args": ["@ton/mcp"],
      "env": {
        "MNEMONIC": "word1 word2 ... word24",
        "NETWORK": "mainnet"
      }
    }
  }
}
```

### HTTP Mode

Start the server and point your MCP client to the endpoint:

```bash
MNEMONIC="..." npx @ton/mcp --http 3000
# MCP endpoint: http://localhost:3000/mcp
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MNEMONIC` | - | 24-word mnemonic phrase (required for mnemonic mode) |
| `NETWORK` | `mainnet` | TON network (`mainnet` / `testnet`) |
| `WALLET_VERSION` | `v5r1` | Wallet version (`v5r1` / `v4r2`) |
| `WALLET_ADDRESS` | - | User's wallet address (for controlled wallet mode) |
| `TONCENTER_API_KEY` | - | Optional TonCenter API key for higher rate limits |

## Wallet Modes

### Mnemonic Mode (Default)
Provide a `MNEMONIC` environment variable to use traditional wallet control with full signing capabilities.

### Controlled Wallet Mode
When `MNEMONIC` is not provided, the MCP operates in controlled wallet mode:
1. Checks for existing keypair in `~/.ton/key.json`
2. If not found, requires `WALLET_ADDRESS` and generates a new keypair
3. Stores the keypair for future use
4. Uses this keypair to sign transactions (requires wallet to authorize the public key)

## Available Tools

### Balance & Info

#### `get_balance`
Get the TON balance of the wallet.

**Returns:** Balance in TON and nanoTON

#### `get_jetton_balance`
Get the balance of a specific Jetton.

**Parameters:**
- `jettonAddress` (required): Jetton master contract address

#### `get_jettons`
List all Jettons in the wallet with balances and metadata.

#### `get_transactions`
Get recent transaction history.

**Parameters:**
- `limit` (optional): Max transactions to return (default: 20, max: 100)

**Returns:** Transaction events including TON transfers, Jetton transfers, swaps

#### `get_known_jettons`
Get a list of known/popular Jettons on TON with their addresses and metadata.

### Transfers

#### `send_ton`
Send TON to an address.

**Parameters:**
- `toAddress` (required): Recipient TON address
- `amount` (required): Amount in TON (e.g., "1.5" for 1.5 TON)
- `comment` (optional): Transaction comment/memo

#### `send_jetton`
Send Jettons to an address.

**Parameters:**
- `toAddress` (required): Recipient TON address
- `jettonAddress` (required): Jetton master contract address
- `amount` (required): Amount in human-readable format
- `comment` (optional): Transaction comment/memo

#### `send_raw_transaction`
Send a raw transaction with full control over messages.

**Parameters:**
- `messages` (required): Array of messages with `address`, `amount` (nanoTON), optional `stateInit` and `payload` (Base64)
- `validUntil` (optional): Unix timestamp for transaction expiry
- `fromAddress` (optional): Sender wallet address

### Swaps

#### `get_swap_quote`
Get a quote for swapping tokens.

**Parameters:**
- `fromToken` (required): Token to swap from ("TON" or jetton address)
- `toToken` (required): Token to swap to ("TON" or jetton address)
- `amount` (required): Amount to swap in raw units
- `slippageBps` (optional): Slippage tolerance in basis points (default: 100 = 1%)

**Returns:** Quote details and transaction params for `send_raw_transaction`

### NFTs

#### `get_nfts`
List all NFTs in the wallet.

**Parameters:**
- `limit` (optional): Max NFTs to return (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

#### `get_nft`
Get detailed information about a specific NFT.

**Parameters:**
- `nftAddress` (required): NFT item contract address

#### `send_nft`
Transfer an NFT to another address.

**Parameters:**
- `nftAddress` (required): NFT item contract address
- `toAddress` (required): Recipient TON address
- `comment` (optional): Transaction comment/memo

### DNS

#### `resolve_dns`
Resolve a TON DNS domain to a wallet address.

**Parameters:**
- `domain` (required): TON DNS domain (e.g., "foundation.ton")

#### `back_resolve_dns`
Reverse resolve a wallet address to its DNS domain.

**Parameters:**
- `address` (required): TON wallet address

## Serverless Deployment

The package exports a serverless handler for deployment to AWS Lambda, Vercel, etc.

```typescript
// AWS Lambda
import { createServerlessHandler } from '@ton/mcp/serverless';
export const handler = createServerlessHandler();

// Vercel
import { createServerlessHandler } from '@ton/mcp/serverless';
export default createServerlessHandler();
```

### Serverless Headers

Pass credentials via request headers:

| Header | Description |
|--------|-------------|
| `MNEMONIC` or `mnemonic` | 24-word mnemonic phrase |
| `PRIVATE_KEY` or `private-key` | Hex-encoded private key (priority over mnemonic) |
| `NETWORK` or `network` | Network (`mainnet` / `testnet`) |
| `TONCENTER_KEY` or `toncenter-key` | Optional TonCenter API key |

## Development

```bash
# Run from source (stdio)
pnpm --filter @ton/mcp dev:cli

# Run from source (HTTP)
pnpm --filter @ton/mcp dev:cli:http

# Build
pnpm --filter @ton/mcp build

# Run built version
node packages/mcp/dist/cli.js
node packages/mcp/dist/cli.js --http 8080
```

## Library Usage

The package exports a programmatic API for building custom MCP servers:

```typescript
import { createTonWalletMCP } from '@ton/mcp';
import { Signer, WalletV5R1Adapter, TonWalletKit, Network, MemoryStorageAdapter } from '@ton/walletkit';

// Initialize kit
const kit = new TonWalletKit({
  networks: { [Network.mainnet().chainId]: {} },
  storage: new MemoryStorageAdapter(),
});
await kit.waitForReady();

// Create wallet adapter
const signer = await Signer.fromMnemonic(mnemonic, { type: 'ton' });
const walletAdapter = await WalletV5R1Adapter.create(signer, {
  client: kit.getApiClient(Network.mainnet()),
  network: Network.mainnet(),
});
const wallet = await kit.addWallet(walletAdapter);

// Create MCP server
const server = await createTonWalletMCP({ wallet });

// Connect to transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Agent Skills

This package includes skill files for AI agent integration:

- **`skills/SKILL.md`** - Concise skill description for Claude Code and compatible agents
- **`llms.txt`** - Detailed tool documentation for LLM context

### Using with Claude Code

Copy the skill to your project:

```bash
mkdir -p .claude/skills/ton-wallet
cp node_modules/@ton/mcp/skills/SKILL.md .claude/skills/ton-wallet/
```

### Using llms.txt

The `llms.txt` file follows the [llms.txt standard](https://llmstxt.org/) and can be used to provide context to any LLM about the available tools.

## License

MIT
