import Web3 from 'web3';

/**
 * Gets the current account from MetaMask/Web3 provider
 * @returns The current account address or null if unavailable
 */
export const getCurrentAccount = async (): Promise<string | null> => {
  try {
    if (!window.ethereum) {
      console.error('No Ethereum provider found');
      return null;
    }

    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    
    if (accounts && accounts.length > 0) {
      return accounts[0];
    } else {
      try {
        // Try requesting accounts access if we don't have it yet
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        return accounts[0] || null;
      } catch (error) {
        console.error('Error requesting accounts access:', error);
        return null;
      }
    }
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Ensures that an account is connected and returns it
 * @param componentName For logging
 * @returns The current account or throws an error
 */
export const ensureAccount = async (componentName: string): Promise<string> => {
  const account = await getCurrentAccount();
  
  if (!account) {
    console.error(`[${componentName}] No connected account found`);
    throw new Error('No Ethereum account connected. Please connect to MetaMask.');
  }
  
  return account;
};

/**
 * Helper to execute a function with a guaranteed account parameter
 * @param fn The function to execute (that requires an account)
 * @param errorHandler Optional error handler
 * @returns Result of the function or error
 */
export async function withAccount<T>(
  fn: (account: string) => Promise<T>,
  errorHandler?: (error: any) => T | Promise<T>
): Promise<T> {
  try {
    const account = await ensureAccount('withAccount');
    return await fn(account);
  } catch (error) {
    console.error('Error in withAccount:', error);
    if (errorHandler) {
      return await errorHandler(error);
    }
    throw error;
  }
}

/**
 * Creates a wrapper for Web3 functions that need an account parameter
 * @param fn The original function that takes contract and account
 * @returns A new function that only needs contract (account is sourced automatically)
 */
export function withAutoAccount<T>(
  fn: (contract: any, account: string, ...args: any[]) => Promise<T>
) {
  return async (contract: any, ...args: any[]): Promise<T> => {
    try {
      const account = await ensureAccount(`AutoAccount(${fn.name})`);
      return await fn(contract, account, ...args);
    } catch (error) {
      console.error(`Error in ${fn.name} with auto account:`, error);
      throw error;
    }
  };
}
