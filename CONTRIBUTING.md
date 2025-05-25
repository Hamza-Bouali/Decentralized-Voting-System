# Contributing to VDapp

Thank you for your interest in contributing to VDapp! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/VDapp.git`
3. Create your feature branch: `git checkout -b feature/amazing-feature`

## Development Environment Setup

1. Install dependencies:
   ```bash
   cd VDapp/project
   npm install
   ```

2. Set up the local blockchain:
   - Install Ganache or use Hardhat for a local Ethereum blockchain
   - Deploy the smart contracts to your local blockchain
   - Update the contract address in `/src/lib/web3.ts`

3. Configure MetaMask:
   - Connect MetaMask to your local blockchain
   - Import test accounts as needed

## Code Style and Conventions

- Follow the TypeScript coding style used in the project
- Use functional components with hooks for React components
- Use meaningful variable and function names
- Add comments for complex logic
- Update types in the `/src/types` directory as needed

## Testing

- Write unit tests for new functionality
- Test both the UI components and smart contract interactions
- Ensure backward compatibility

## Pull Request Process

1. Update the README.md with details of changes if appropriate
2. Update the documentation as needed
3. The PR should work properly on a local development environment
4. Make sure your code passes all tests
5. Create a Pull Request with a clear description of the changes

## Smart Contract Development

When making changes to smart contracts:

1. Test thoroughly with various scenarios
2. Consider gas optimization
3. Document state changes and function behaviors
4. Update the contract ABI in the frontend if needed

## Reporting Issues

- Use the GitHub issue tracker
- Clearly describe the issue including steps to reproduce
- Include screenshots if applicable
- Tag with appropriate labels

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help maintain a positive community

Thank you for your contributions!
