import Web3 from 'web3';
import { contractABI } from './contract';

export const contractAddress = '0xE9732d3A3dFCaf5Bc35B37781E6639Bba25DBe11';

// Store the current connected account to detect changes
let currentConnectedAccount = '';

export const initializeWeb3 = async () => {
  if (window.ethereum) {
    try {
      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3Instance.eth.getAccounts();
      currentConnectedAccount = accounts[0];

      // Set up event listener for account changes
      window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
        // Force reload to ensure the UI reflects the new account state
        window.location.reload();
      });

      const contract = new web3Instance.eth.Contract(contractABI, contractAddress);
      
      // Verify owner to ensure that the contract is correctly connected
      const owner = await contract.methods.owner().call();
      console.log(`Contract owner address: ${owner}`);
      console.log(`Current connected account: ${currentConnectedAccount}`);
      
      return { 
        web3: web3Instance, 
        contract, 
        account: currentConnectedAccount,
        error: null 
      };
    } catch (error) {
      console.error('Error initializing Web3:', error);
      return { 
        web3: null, 
        contract: null, 
        account: '', 
        error: 'Failed to connect to MetaMask. Please make sure it is installed and unlocked.' 
      };
    }
  } else {
    return { 
      web3: null, 
      contract: null, 
      account: '', 
      error: 'MetaMask is not installed. Please install MetaMask to use this application.' 
    };
  }
};

export const checkIfAdmin = async (contract: any, account: string) => {
  try {
    if (!account) {
      console.error('No account provided to checkIfAdmin', new Error().stack);
      return false;
    }

    const owner = await contract.methods.owner().call();
    const isAdmin = account.toLowerCase() === owner.toLowerCase();
    console.log(`Admin check - Account: ${account}, Owner: ${owner}, Is Admin: ${isAdmin}`);
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const ensureCorrectAccount = async (web3: any, expectedAccount: string) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const currentAccount = accounts[0];
    
    if (currentAccount.toLowerCase() !== expectedAccount.toLowerCase()) {
      console.warn('Account mismatch detected', {
        expected: expectedAccount,
        current: currentAccount
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking account:', error);
    return false;
  }
};

// Refreshes the account and ensures we're using the correct one
export const refreshAccount = async (web3: any) => {
  try {
    const accounts = await web3.eth.getAccounts();
    currentConnectedAccount = accounts[0];
    return currentConnectedAccount;
  } catch (error) {
    console.error('Error refreshing account:', error);
    return '';
  }
};

export const getVoterStatus = async (contract: any, account: string) => {
  try {
    return await contract.methods.voters(account).call();
  } catch (error) {
    console.error('Error getting voter status:', error);
    return {
      isRegistered: false,
      hasVoted: false,
      vote: '0',
      hasRequested: false
    };
  }
};

export const getVotingStatus = async (contract: any) => {
  try {
    const isStarted = await contract.methods.votingStarted().call();
    const isEnded = await contract.methods.votingEnded().call();
    return { isStarted, isEnded };
  } catch (error) {
    console.error('Error getting voting status:', error);
    return { isStarted: false, isEnded: false };
  }
};

export const getCandidates = async (contract: any) => {
  try {
    const count = await contract.methods.candidatesCount().call();
    const candidates = [];
    
    for (let i = 1; i <= count; i++) {
      const candidate = await contract.methods.candidates(i).call();
      candidates.push(candidate);
    }
    
    return candidates;
  } catch (error) {
    console.error('Error getting candidates:', error);
    return [];
  }
};

export const requestRegistration = async (contract: any, account: string) => {
  try {
    await contract.methods.requestVoterRegistration().send({ from: account });
    return { success: true, message: 'Registration request sent successfully.' };
  } catch (error: any) {
    console.error('Error requesting registration:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send registration request.' 
    };
  }
};

export const voteForCandidate = async (contract: any, account: string, candidateId: string) => {
  try {
    await contract.methods.vote(candidateId).send({ from: account });
    return { success: true, message: 'Vote cast successfully.' };
  } catch (error: any) {
    console.error('Error voting:', error);
    
    let errorMessage = 'Failed to cast vote.';
    if (error.message) {
      if (error.message.includes('Not a registered voter')) {
        errorMessage = 'You are not registered to vote. Please request registration first.';
      } else if (error.message.includes('Already voted')) {
        errorMessage = 'You have already cast your vote.';
      } else if (error.message.includes('Invalid candidate')) {
        errorMessage = 'The candidate ID you entered is invalid.';
      } else if (error.message.includes('Voting is not active')) {
        errorMessage = 'Voting is not currently active.';
      }
    }
    
    return { success: false, message: errorMessage };
  }
};

export const getWinner = async (contract: any) => {
  try {
    return await contract.methods.getWinner().call();
  } catch (error: any) {
    console.error('Error getting winner:', error);
    if (error.message && error.message.includes('Voting has not ended')) {
      return 'Voting has not ended yet.';
    }
    return 'Failed to get winner.';
  }
};

// Admin functions
export const addCandidate = async (contract: any, account: string, name: string) => {
  try {
    console.log(`addCandidate called with account: ${account}`);
    
    if (!account) {
      console.error("No account provided to addCandidate", new Error().stack);
      return { 
        success: false, 
        message: "No connected account. Please ensure MetaMask is connected."
      };
    }
    
    // Verify admin status before proceeding
    const isAdmin = await checkIfAdmin(contract, account);
    if (!isAdmin) {
      return { 
        success: false, 
        message: "Current account is not the contract owner. Please switch to the admin account in MetaMask."
      };
    }
    
    await contract.methods.addCandidate(name).send({ from: account });
    return { success: true, message: 'Candidate added successfully.' };
  } catch (error: any) {
    console.error('Error adding candidate:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to add candidate.' 
    };
  }
};

export const approveVoter = async (contract: any, account: string, voterAddress: string) => {
  try {
    // Verify admin status before proceeding
    const isAdmin = await checkIfAdmin(contract, account);
    if (!isAdmin) {
      return { 
        success: false, 
        message: "Current account is not the contract owner. Please switch to the admin account in MetaMask."
      };
    }
    
    await contract.methods.approveVoter(voterAddress).send({ from: account });
    return { success: true, message: 'Voter approved successfully.' };
  } catch (error: any) {
    console.error('Error approving voter:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to approve voter.' 
    };
  }
};

export const rejectVoter = async (contract: any, account: string, voterAddress: string) => {
  try {
    // Verify admin status before proceeding
    const isAdmin = await checkIfAdmin(contract, account);
    if (!isAdmin) {
      return { 
        success: false, 
        message: "Current account is not the contract owner. Please switch to the admin account in MetaMask."
      };
    }
    
    await contract.methods.rejectVoterRequest(voterAddress).send({ from: account });
    return { success: true, message: 'Voter rejected successfully.' };
  } catch (error: any) {
    console.error('Error rejecting voter:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to reject voter.' 
    };
  }
};

export const startVoting = async (contract: any, account: string) => {
  try {
    // Verify admin status before proceeding
    const isAdmin = await checkIfAdmin(contract, account);
    if (!isAdmin) {
      return { 
        success: false, 
        message: "Current account is not the contract owner. Please switch to the admin account in MetaMask."
      };
    }
    
    const status = await getVotingStatus(contract);
    if (status.isStarted && status.isEnded) {
      return { 
        success: false, 
        message: 'Voting has ended. You need to deploy a new contract instance to start another voting session.'
      };
    }
    
    await contract.methods.startVoting().send({ from: account });
    return { success: true, message: 'Voting started successfully.' };
  } catch (error: any) {
    console.error('Error starting voting:', error);
    
    let errorMessage = 'Failed to start voting.';
    if (error.message && error.message.includes('Voting already started')) {
      errorMessage = 'Voting has already been started and is still in progress.';
    }
    
    return { success: false, message: errorMessage };
  }
};

export const endVoting = async (contract: any, account: string) => {
  try {
    // Verify admin status before proceeding
    const isAdmin = await checkIfAdmin(contract, account);
    if (!isAdmin) {
      return { 
        success: false, 
        message: "Current account is not the contract owner. Please switch to the admin account in MetaMask."
      };
    }
    
    await contract.methods.endVoting().send({ from: account });
    return { success: true, message: 'Voting ended successfully.' };
  } catch (error: any) {
    console.error('Error ending voting:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to end voting.' 
    };
  }
};

export const getRegistrationRequests = async (contract: any, account?: string) => {
  try {
    // Enhanced debugging
    console.log(`getRegistrationRequests called with account:`, account);
    
    // Check if account is provided
    if (!account) {
      // Try to get current account from web3 if available
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          if (accounts && accounts.length > 0) {
            account = accounts[0];
            console.log(`Retrieved current account from web3:`, account);
          }
        }
      } catch (err) {
        console.error("Failed to retrieve account from web3:", err);
      }
      
      // If still no account, throw error
      if (!account) {
        console.error("No account provided to getRegistrationRequests", new Error().stack);
        throw new Error("Account not provided");
      }
    }

    // First verify we're still using the owner account
    const isAdmin = await checkIfAdmin(contract, account);
    console.log(`Is admin check for ${account} returned: ${isAdmin}`);
    
    if (!isAdmin) {
      throw new Error("Current account is not the contract owner. Please switch to the admin account in MetaMask.");
    }
    
    console.log("Getting registration requests using account:", account);
    // Pass the account explicitly in the call options
    return await contract.methods.getRegistrationRequests().call({ from: account });
  } catch (error) {
    console.error('Error getting registration requests:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get registration requests: ${error.message}`);
    }
    return [];
  }
};