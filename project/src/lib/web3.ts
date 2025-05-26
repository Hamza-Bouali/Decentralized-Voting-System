import Web3 from 'web3';
import { contractABI } from './contract';

export const contractAddress = '0x1183338e09ecC0FD623Abf3A00346A89ac328dae';

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
        // Log the new account being used
        if (newAccounts.length > 0) {
          console.log(`Account changed from ${currentConnectedAccount} to ${newAccounts[0]}`);
          currentConnectedAccount = newAccounts[0];
        }
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

export const checkIfAdmin = async (contract: any, account: string): Promise<boolean> => {
  try {
    if (!account) {
      const errorMsg = 'No account provided to checkIfAdmin';
      console.error(errorMsg, new Error().stack);
      throw new Error(errorMsg);
    }

    if (!contract) {
      console.error('No contract provided to checkIfAdmin');
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

export const requestRegistration = async (contract: any, account: string, cin: string) => {
  try {
    // First check if the voter is already registered
    const voterStatus = await contract.methods.voters(account).call();
    if (voterStatus.isRegistered) {
      return { 
        success: false, 
        message: 'You are already registered as a voter.' 
      };
    }

    // Then check if they have already requested registration
    if (voterStatus.hasRequested) {
      return { 
        success: false, 
        message: 'You have already submitted a registration request.' 
      };
    }

    // Validate CIN format
    if (!cin || cin.trim() === '') {
      return {
        success: false,
        message: 'Please provide a valid CIN number.'
      };
    }

    // Attempt the registration
    const receipt = await contract.methods.requestVoterRegistration(cin).send({ from: account });
    
    // Check if the transaction was successful
    if (receipt.status === false) {
      return {
        success: false,
        message: 'Transaction was reverted. Please check if your CIN has already been used.'
      };
    }

    return { success: true, message: 'Registration request sent successfully.' };
  } catch (error: any) {
    console.error('Error requesting registration:', error);
    let errorMessage = 'Failed to send registration request.';
    
    if (error.message) {
      // Check for specific revert reasons
      if (error.message.includes('CIN already used')) {
        errorMessage = 'This CIN has already been used for registration.';
      } else if (error.message.includes('Already registered')) {
        errorMessage = 'You are already registered as a voter.';
      } else if (error.message.includes('Already requested')) {
        errorMessage = 'You have already submitted a registration request.';
      } else if (error.message.includes('revert')) {
        // Try to extract the revert reason
        const revertMatch = error.message.match(/reverted: (.*?)(?:"|$)/);
        if (revertMatch && revertMatch[1]) {
          errorMessage = `Registration failed: ${revertMatch[1]}`;
        } else {
          // If no specific reason, check the transaction receipt
          if (error.receipt) {
            console.log('Transaction receipt:', error.receipt);
            errorMessage = 'Registration failed. Please check if you meet all requirements. ( The CIN is valid and correct )';
          }
        }
      }
    }
    
    return { 
      success: false, 
      message: errorMessage 
    };
  }
};

export const voteForCandidate = async (contract: any, account: string, candidateId: string) => {
  try {
    // Validate inputs
    if (!candidateId || candidateId === "") {
      return { 
        success: false, 
        message: 'Please select a candidate to vote for.' 
      };
    }
    
    // Validate that candidateId is a valid number
    const candidateIdNum = parseInt(candidateId);
    if (isNaN(candidateIdNum)) {
      console.error(`Invalid candidate ID: ${candidateId} is not a valid number`);
      return { 
        success: false, 
        message: 'Invalid candidate ID format.' 
      };
    }
    
    console.log(`Submitting vote for candidate ID: ${candidateId} from account: ${account}`);
    
    // Get the current status of the voter
    const voterStatus = await contract.methods.voters(account).call();
    if (voterStatus.hasVoted) {
      return { 
        success: false, 
        message: 'You have already cast your vote.' 
      };
    }
    
    // Proceed with the vote
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
      } else if (error.message.includes('revert')) {
        // Extract the revert reason if available
        const revertMatch = error.message.match(/reverted: (.*?)(?:"|$)/);
        if (revertMatch && revertMatch[1]) {
          errorMessage = `Smart contract error: ${revertMatch[1]}`;
        }
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
    if (!contract) {
      return { 
        success: false, 
        message: "Contract is not initialized"
      };
    }
    
    if (!account) {
      const errorMsg = "No account provided to startVoting";
      console.error(errorMsg, new Error().stack);
      return { 
        success: false, 
        message: errorMsg
      };
    }

    // Log the actual values being passed to checkIfAdmin
    console.log(`startVoting: Checking admin status for account ${account}`);
    
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
    
    console.log(`Starting voting with account: ${account}`);
    await contract.methods.startVoting().send({ from: account });
    return { success: true, message: 'Voting started successfully.' };
  } catch (error: any) {
    console.error('Error starting voting:', error);
    
    let errorMessage = 'Failed to start voting.';
    if (error.message) {
      if (error.message.includes('Voting already started')) {
        errorMessage = 'Voting has already been started and is still in progress.';
      } else if (error.message.includes('revert')) {
        // Extract revert reason if available
        const revertMatch = error.message.match(/reverted: (.*?)(?:"|$)/);
        if (revertMatch && revertMatch[1]) {
          errorMessage = `Contract error: ${revertMatch[1]}`;
        } else {
          errorMessage = 'Transaction was reverted by the contract';
        }
      }
    }
    
    return { success: false, message: errorMessage };
  }
};

export const endVoting = async (contract: any, account: string) => {
  try {
    if (!contract) {
      return { 
        success: false, 
        message: "Contract is not initialized"
      };
    }
    
    if (!account) {
      const errorMsg = "No account provided to endVoting";
      console.error(errorMsg, new Error().stack);
      return { 
        success: false, 
        message: errorMsg
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

export const getRegistrationRequests = async (contract: any, account: string): Promise<string[]> => {
  try {
    // Enhanced debugging
    console.log(`getRegistrationRequests called with account:`, account);
    
    // Check if contract is provided
    if (!contract) {
      console.error("No contract provided to getRegistrationRequests");
      throw new Error("Contract not provided");
    }
    
    // Check if account is provided
    if (!account) {
      // Log the error with stack trace for better debugging
      const errorMsg = "No account provided to getRegistrationRequests";
      console.error(errorMsg, new Error().stack);
      throw new Error(errorMsg);
    }

    // First verify we're still using the owner account
    const isAdmin = await checkIfAdmin(contract, account);
    console.log(`Is admin check for ${account} returned: ${isAdmin}`);
    
    if (!isAdmin) {
      throw new Error("Current account is not the contract owner. Please switch to the admin account in MetaMask.");
    }
    
    console.log("Getting registration requests using account:", account);
    try {
      // Pass the account explicitly in the call options and catch specific errors
      const result = await contract.methods.getRegistrationRequests().call({ from: account });
      return result || [];
    } catch (contractError) {
      console.error("Contract error in getRegistrationRequests:", contractError);
      // Return empty array instead of throwing to make the UI more resilient
      return [];
    }
  } catch (error) {
    console.error('Error getting registration requests:', error);
    if (error instanceof Error) {
      // Just log but don't throw, return an empty array instead
      console.error(`Failed to get registration requests: ${error.message}`);
    }
    return [];
  }
};


export const resetVoting = async (contract: any, account: string) => {
  try {
    if (!contract) {
      return { 
        success: false, 
        message: "Contract is not initialized"
      };
    }
    
    if (!account) {
      const errorMsg = "No account provided to resetVoting";
      console.error(errorMsg, new Error().stack);
      return { 
        success: false, 
        message: errorMsg
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
    
    const status = await getVotingStatus(contract);
    if (!status.isEnded) {
      return { 
        success: false, 
        message: 'Voting must be ended before it can be reset.'
      };
    }
    
    console.log(`Resetting voting with account: ${account}`);
    await contract.methods.resetVoting().send({ from: account });
    return { success: true, message: 'Voting has been reset successfully.' };
  } catch (error: any) {
    console.error('Error resetting voting:', error);
    
    let errorMessage = 'Failed to reset voting.';
    if (error.message) {
      if (error.message.includes('revert')) {
        // Extract revert reason if available
        const revertMatch = error.message.match(/reverted: (.*?)(?:"|$)/);
        if (revertMatch && revertMatch[1]) {
          errorMessage = `Contract error: ${revertMatch[1]}`;
        } else {
          errorMessage = 'Transaction was reverted by the contract';
        }
      }
    }
    
    return { success: false, message: errorMessage };
  }
};

export const getCIN = async (contract: any, account: string, voterAddress: string): Promise<string> => {
  try {
    return await contract.methods.getCIN(voterAddress).call({ from: account });
  } catch (error: any) {
    console.error('Error getting CIN:', error);
    throw new Error('Failed to get CIN information');
  }
};