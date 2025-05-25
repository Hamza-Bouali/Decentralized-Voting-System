export const parseMetaMaskError = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  
  // Extract the actual error message from MetaMask error
  if (error.message) {
    // Check common MetaMask errors
    if (error.message.includes('User denied transaction signature')) {
      return 'Transaction was rejected in MetaMask';
    }
    
    if (error.message.includes('execution reverted')) {
      // Extract the specific revert reason if available
      const match = error.message.match(/execution reverted: (.*?)"/);
      if (match && match[1]) {
        return `Contract error: ${match[1]}`;
      }
      return 'Transaction was reverted by the contract';
    }
    
    if (error.message.includes('Only owner')) {
      return 'This action can only be performed by the contract owner';
    }
    
    if (error.message.includes('insufficient funds')) {
      return 'Your wallet has insufficient funds for this transaction';
    }
    
    // Return the raw message if none of the above
    return error.message;
  }
  
  // Fallback for other error types
  return 'Transaction failed. Check console for details.';
};

export const getNetworkName = async (web3: any): Promise<string> => {
  try {
    const networkId = await web3.eth.net.getId();
    switch (networkId) {
      case 1: return 'Ethereum Mainnet';
      case 3: return 'Ropsten Testnet';
      case 4: return 'Rinkeby Testnet';
      case 5: return 'Goerli Testnet';
      case 42: return 'Kovan Testnet';
      case 56: return 'Binance Smart Chain';
      case 97: return 'Binance Smart Chain Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Mumbai Testnet';
      case 31337: return 'Hardhat Local Network';
      case 1337: return 'Local Network';
      default: return `Network ID: ${networkId}`;
    }
  } catch (error) {
    console.error('Error getting network:', error);
    return 'Unknown Network';
  }
};
