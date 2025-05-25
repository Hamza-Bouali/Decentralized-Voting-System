import { withAutoAccount, ensureAccount } from './account-utils';
import { checkIfAdmin } from './web3';

/**
 * Safe implementation of getRegistrationRequests with proper account handling
 */
export const getRegistrationRequestsSafe = async (contract: any): Promise<string[]> => {
  try {
    const account = await ensureAccount('getRegistrationRequestsSafe');
    
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

/**
 * Create auto-account versions of admin functions
 */
export const autoAccountAdminFunctions = {
  getRegistrationRequests: withAutoAccount(async (contract, account) => {
    return await contract.methods.getRegistrationRequests().call({ from: account });
  }),
  
  addCandidate: withAutoAccount(async (contract, account, name) => {
    await checkAdminAccess(contract, account);
    return await contract.methods.addCandidate(name).send({ from: account });
  }),
  
  approveVoter: withAutoAccount(async (contract, account, voterAddress) => {
    await checkAdminAccess(contract, account);
    return await contract.methods.approveVoter(voterAddress).send({ from: account });
  }),
  
  rejectVoter: withAutoAccount(async (contract, account, voterAddress) => {
    await checkAdminAccess(contract, account);
    return await contract.methods.rejectVoterRequest(voterAddress).send({ from: account });
  }),
  
  startVoting: withAutoAccount(async (contract, account) => {
    await checkAdminAccess(contract, account);
    return await contract.methods.startVoting().send({ from: account });
  }),
  
  endVoting: withAutoAccount(async (contract, account) => {
    await checkAdminAccess(contract, account);
    return await contract.methods.endVoting().send({ from: account });
  })
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
    getRegistrationRequests: async () => {
      try {
        return await getRegistrationRequestsSafe(contract);
      } catch (error) {
        console.error('Error getting registration requests:', error);
        throw error;
      }
    },
    
    addCandidate: async (name: string) => {
      try {
        const account = await ensureAccount('addCandidate');
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
