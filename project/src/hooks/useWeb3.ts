import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { initializeWeb3, contractAddress, checkIfAdmin } from '../lib/web3';
import { contractABI } from '../lib/contract';
import { getCurrentAccount } from '../lib/account-utils';

export function useWeb3() {
  const [web3, setWeb3] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Web3
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const { web3, contract, account, error } = await initializeWeb3();
        
        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }
        
        if (web3 && contract && account) {
          setWeb3(web3);
          setContract(contract);
          setAccount(account);
          
          // Check if connected account is admin
          const adminStatus = await checkIfAdmin(contract, account);
          setIsAdmin(adminStatus);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Web3:', err);
        setError('Failed to initialize Web3');
        setIsLoading(false);
      }
    };
    
    init();
    
    // Setup account change listener
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount('');
          setIsAdmin(false);
        } else {
          setAccount(accounts[0]);
          
          // Update admin status when account changes
          if (contract) {
            const adminStatus = await checkIfAdmin(contract, accounts[0]);
            setIsAdmin(adminStatus);
          }
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Function to refresh the current account
  const refreshAccount = useCallback(async () => {
    try {
      const currentAccount = await getCurrentAccount();
      if (currentAccount) {
        setAccount(currentAccount);
        
        if (contract) {
          const adminStatus = await checkIfAdmin(contract, currentAccount);
          setIsAdmin(adminStatus);
        }
      }
      return currentAccount;
    } catch (err) {
      console.error('Error refreshing account:', err);
      return null;
    }
  }, [contract]);

  return {
    web3,
    contract,
    account,
    isAdmin,
    error,
    isLoading,
    refreshAccount
  };
}
