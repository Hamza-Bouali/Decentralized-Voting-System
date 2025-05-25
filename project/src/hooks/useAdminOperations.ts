import { useState } from 'react';
import { useWeb3 } from './useWeb3';
import { getRegistrationRequestsSafe } from '../lib/admin-operations';
import { ensureAccount } from '../lib/account-utils';
import { checkIfAdmin } from '../lib/web3';

export function useAdminOperations() {
  const { contract, account, isAdmin } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRegistrationRequests = async (): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      
      // Use the safe implementation
      const requests = await getRegistrationRequestsSafe(contract);
      return requests;
    } catch (err: any) {
      setError(err.message || 'Failed to get registration requests');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  const addCandidate = async (name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      
      const currentAccount = await ensureAccount('addCandidate');
      
      // Verify admin status
      if (!isAdmin) {
        const adminCheck = await checkIfAdmin(contract, currentAccount);
        if (!adminCheck) {
          throw new Error('You are not the contract owner');
        }
      }
      
      await contract.methods.addCandidate(name).send({ from: currentAccount });
      
      return { success: true, message: 'Candidate added successfully' };
    } catch (err: any) {
      const message = err.message || 'Failed to add candidate';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Define other admin operations similarly
  
  return {
    getRegistrationRequests,
    addCandidate,
    // other operations
    isLoading,
    error
  };
}
