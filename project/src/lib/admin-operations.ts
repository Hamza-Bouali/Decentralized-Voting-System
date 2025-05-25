import { checkIfAdmin } from './web3';

/**
 * Safe implementation of getRegistrationRequests with proper account handling
 */
export const getRegistrationRequestsSafe = async (contract: any, account: string): Promise<string[]> => {
  try {
    if (!account) {
      throw new Error(`No account provided to getRegistrationRequestsSafe`);
    }
    
    console.log(`Getting registration requests with account: ${account}`);
    
    // Check admin access
    const isAdmin = await checkIfAdmin(contract, account);
    if (!isAdmin) {
      throw new Error(`Account ${account} is not the contract owner`);
    }
    
    // Call the contract method with explicit account
    return await contract.methods.getRegistrationRequests().call({ from: account });
  } catch (error) {
    console.error('Error in getRegistrationRequestsSafe:', error);
    throw error;
  }
};

interface Contract {
  methods: {
    getRegistrationRequests(): {
      call(options: { from: string }): Promise<string[]>;
    };
    addCandidate(name: string): {
      send(options: { from: string }): Promise<any>;
    };
    approveVoter(voterAddress: string): {
      send(options: { from: string }): Promise<any>;
    };
    rejectVoterRequest(voterAddress: string): {
      send(options: { from: string }): Promise<any>;
    };
    startVoting(): {
      send(options: { from: string }): Promise<any>;
    };
    endVoting(): {
      send(options: { from: string }): Promise<any>;
    };
    resetVoting(): {
      send(options: { from: string }): Promise<any>;
    };
  };
}

// Define withAutoAccount type but don't implement it yet
type WithAutoAccountFn = <T extends (...args: any[]) => Promise<any>>(fn: T) => T;

// Define a mock implementation instead of using the import
const withAutoAccount: WithAutoAccountFn = <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
  // This is a simple wrapper that just forwards the call
  // In a real implementation, this would handle account selection
  return (async (...args: any[]): Promise<any> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Error in withAutoAccount:', error);
      throw error;
    }
  }) as T;
};

// Also define a mock ensureAccount function
const ensureAccount = async (functionName: string): Promise<string> => {
  console.log(`ensureAccount called for ${functionName}`);
  throw new Error('ensureAccount not properly implemented');
};

export const resetVoting: (contract: Contract, account: string) => Promise<any> = withAutoAccount(
  async (contract: Contract, account: string) => {
    await checkAdminAccess(contract, account);
    return await contract.methods.resetVoting().send({ from: account });
  }
);

/**
 * Create auto-account versions of admin functions
 */
interface AutoAccountAdminFunctions {
  getRegistrationRequests: (contract: Contract, account: string) => Promise<string[]>;
  addCandidate: (contract: Contract, account: string, name: string) => Promise<any>;
  approveVoter: (contract: Contract, account: string, voterAddress: string) => Promise<any>;
  rejectVoter: (contract: Contract, account: string, voterAddress: string) => Promise<any>;
  startVoting: (contract: Contract, account: string) => Promise<any>;
  endVoting: (contract: Contract, account: string) => Promise<any>;
}

export const autoAccountAdminFunctions: AutoAccountAdminFunctions = {
  getRegistrationRequests: withAutoAccount(
    async (contract: Contract, account: string) => {
      return await contract.methods.getRegistrationRequests().call({ from: account });
    }
  ),
  
  addCandidate: withAutoAccount(
    async (contract: Contract, account: string, name: string) => {
      await checkAdminAccess(contract, account);
      return await contract.methods.addCandidate(name).send({ from: account });
    }
  ),
  
  approveVoter: withAutoAccount(
    async (contract: Contract, account: string, voterAddress: string) => {
      await checkAdminAccess(contract, account);
      return await contract.methods.approveVoter(voterAddress).send({ from: account });
    }
  ),
  
  rejectVoter: withAutoAccount(
    async (contract: Contract, account: string, voterAddress: string) => {
      await checkAdminAccess(contract, account);
      return await contract.methods.rejectVoterRequest(voterAddress).send({ from: account });
    }
  ),
  
  startVoting: withAutoAccount(
    async (contract: Contract, account: string) => {
      await checkAdminAccess(contract, account);
      return await contract.methods.startVoting().send({ from: account });
    }
  ),
  
  endVoting: withAutoAccount(
    async (contract: Contract, account: string) => {
      await checkAdminAccess(contract, account);
      return await contract.methods.endVoting().send({ from: account });
    }
  )
};

/**
 * Helper to verify admin access
 */
async function checkAdminAccess(contract: any, account: string): Promise<void> {
  const isAdmin = await checkIfAdmin(contract, account);
  if (!isAdmin) {
    throw new Error(`Account ${account} is not the contract owner`);
  }
}

/**
 * A function that returns a safe wrapper for all admin operations
 * to be used in React components
 */
export const createAdminOperations = (contract: any) => {
  return {
    getRegistrationRequests: async (account: string) => {
      try {
        return await getRegistrationRequestsSafe(contract, account);
      } catch (error) {
        console.error('Error getting registration requests:', error);
        throw error;
      }
    },
    
    addCandidate: async (name: string, account: string) => {
      try {
        await checkAdminAccess(contract, account);
        await contract.methods.addCandidate(name).send({ from: account });
        return { success: true, message: 'Candidate added successfully.' };
      } catch (error: any) {
        return { success: false, message: error.message || 'Failed to add candidate.' };
      }
    },
    
    // Add other admin operations as needed...
  };
};
