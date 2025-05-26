import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { initializeWeb3, contractAddress, checkIfAdmin } from '../lib/web3';
import { getCurrentAccount } from '../lib/account-utils';

export function useWeb3() {
  const [web3, setWeb3] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkId, setNetworkId] = useState<number | null>(null);

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
          
          // Get network information
          try {
            const netId = await web3.eth.net.getId();
            setNetworkId(Number(netId));
            console.log(`Connected to network ID: ${netId}`);
          } catch (netErr) {
            console.error('Error getting network ID:', netErr);
          }
          
          // Check if connected account is admin
          try {
            console.log(`Checking if account ${account} is admin`);
            const adminStatus = await checkIfAdmin(contract, account);
            console.log(`Account ${account} admin status: ${adminStatus}`);
            setIsAdmin(adminStatus);
          } catch (adminErr) {
            console.error('Error checking admin status:', adminErr);
            setIsAdmin(false);
          }
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
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          setAccount('');
          setIsAdmin(false);
        } else {
          const newAccount = accounts[0];
          console.log(`Switched to account: ${newAccount}`);
          setAccount(newAccount);
          
          // Update admin status when account changes
          if (contract) {
            try {
              const adminStatus = await checkIfAdmin(contract, newAccount);
              console.log(`New account ${newAccount} admin status: ${adminStatus}`);
              setIsAdmin(adminStatus);
            } catch (err) {
              console.error('Error checking admin status after account change:', err);
            }
          }
        }
      };
      
      const handleChainChanged = (_chainId: string) => {
        console.log('Chain changed. Reloading page...');
        window.location.reload();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Function to refresh the current account
  const refreshAccount = useCallback(async () => {
    try {
      console.log('Refreshing account information...');
      const currentAccount = await getCurrentAccount();
      if (currentAccount) {
        console.log(`Current account: ${currentAccount}`);
        setAccount(currentAccount);
        
        if (contract) {
          try {
            const adminStatus = await checkIfAdmin(contract, currentAccount);
            console.log(`Refreshed admin status: ${adminStatus}`);
            setIsAdmin(adminStatus);
          } catch (err) {
            console.error('Error checking admin status during refresh:', err);
          }
        }
      } else {
        console.warn('No account found during refresh');
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
    networkId,
    refreshAccount
  };
}
