# Deployment Guide for VDapp

This guide provides instructions for deploying the VDapp application to various environments.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MetaMask browser extension
- Access to an Ethereum network (local, testnet, or mainnet)

## Local Deployment

### 1. Deploy Smart Contract

```bash
# Navigate to the contracts directory
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run a local blockchain
npx hardhat node

# Deploy contract to local blockchain (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

Note the deployed contract address.

### 2. Configure Frontend

Update the contract address in `/project/src/lib/web3.ts`:

```typescript
export const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### 3. Build and Run Frontend

```bash
# Navigate to project directory
cd project

# Install dependencies
npm install

# Run development server
npm run dev

# Or build for production
npm run build
```

## Test Network Deployment

### 1. Deploy Smart Contract to Test Network

```bash
# Create a .env file with your private key and infura URL
echo "PRIVATE_KEY=your_private_key" >> .env
echo "INFURA_URL=your_infura_url" >> .env

# Deploy to Ropsten (or other test networks)
npx hardhat run scripts/deploy.js --network ropsten
```

### 2. Configure Frontend for Test Network

Update the contract address and network information in `/project/src/lib/web3.ts`:

```typescript
export const contractAddress = 'YOUR_TESTNET_CONTRACT_ADDRESS';
// Update network configuration if needed
```

### 3. Build and Deploy Frontend

```bash
# Build the frontend
cd project
npm run build

# Deploy to your hosting service of choice
```

## Production Deployment

### 1. Deploy Smart Contract to Mainnet

```bash
# Make sure your .env file contains the correct private key and Infura URL
npx hardhat run scripts/deploy.js --network mainnet
```

### 2. Configure Frontend for Production

Update the contract address:

```typescript
export const contractAddress = 'YOUR_MAINNET_CONTRACT_ADDRESS';
```

Update any environment-specific configurations.

### 3. Build and Deploy Frontend

```bash
# Build optimized production version
npm run build

# Deploy to your hosting service
```

## Verifying Smart Contract

To verify your smart contract on Etherscan:

```bash
npx hardhat verify --network mainnet YOUR_CONTRACT_ADDRESS
```

## Troubleshooting Common Issues

### Contract Connection Issues

- Ensure you're connected to the correct network in MetaMask
- Check that the contract address is correct
- Verify that the contract ABI matches the deployed contract

### Frontend Connectivity Issues

- Check browser console for errors
- Verify MetaMask is installed and unlocked
- Ensure the user has granted permission to connect to the site

### Transaction Failures

- Check for sufficient gas
- Verify function call parameters
- Ensure the caller has the right permissions

## Monitoring and Maintenance

- Set up monitoring for the smart contract
- Regularly check for security vulnerabilities
- Have a backup and recovery strategy

## Upgrading

To upgrade the application:

1. Deploy a new version of the smart contract if needed
2. Update the contract address in the frontend
3. Rebuild and redeploy the frontend application
