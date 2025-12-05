# TON Wallet

A React Native wallet application for The Open Network (TON) blockchain, built with Expo.

## How to Run

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager
- Expo CLI
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and Android SDK

### Installation

```bash
# Install dependencies
yarn install

# Start the development server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android
```

### Additional Commands

```bash
# Type checking
yarn typecheck

# Format code
yarn format

# Clean build artifacts and dependencies
yarn clean
```

## Available Features

The application includes the following core features:

- **Wallets** - Create, import, and manage TON wallet with secure key storage
- **Balances** - View wallet balances and token holdings
- **Transactions** - Send and receive TON, view transaction history
- **Send** - Transfer TON and tokens to other addresses

## Project Structure

### Wallet Kit

The project uses **@ton/walletkit**, a compiled version of the TON wallet SDK located in the `src/features/wallet-kit` directory. 

For easier imports, TypeScript path aliases have been configured in `tsconfig.json`:

```json
{
  "paths": {
    "@ton/walletkit": ["./src/features/wallet-kit"],
    "@ton/walletkit/*": ["./src/features/wallet-kit/*"]
  }
}
```
