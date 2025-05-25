import React, { useState, useEffect } from 'react';
import { 
  addCandidate, 
  approveVoter, 
  rejectVoter, 
  startVoting, 
  endVoting,
  getRegistrationRequests,
  getVotingStatus,
  resetVoting // Add this import
} from '../lib/web3';
import { VotingState } from '../types';

interface AdminPanelProps {
  contract?: any; // Make contract optional
  account?: string; // Make account optional
  // Alternative prop approach with function handlers
  onAddCandidate?: (name: string) => Promise<any>;
  onApproveVoter?: (address: string) => Promise<any>;
  onRejectVoter?: (address: string) => Promise<any>;
  onStartVoting?: () => Promise<any>;
  onEndVoting?: () => Promise<any>;
  onGetRequests?: () => Promise<string[]>;
  onResetVoting?: () => Promise<any>;
  votingStatus?: VotingState;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  contract, 
  account,
  onAddCandidate,
  onApproveVoter,
  onRejectVoter,
  onResetVoting,
  onStartVoting,
  onEndVoting,
  onGetRequests,
  votingStatus: externalVotingStatus
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [registrationRequests, setRegistrationRequests] = useState<string[]>([]);
  const [votingStatus, setVotingStatus] = useState<VotingState>(
    externalVotingStatus || { isStarted: false, isEnded: false }
  );
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Keep track if we're using direct Web3 or handler functions
  const useDirectWeb3 = Boolean(contract && account);
  
  // Add this utility to handleResetVoting button click
  const handleResetVoting = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      let result;
      
      if (useDirectWeb3 && account) {
        console.log(`Resetting voting with account: ${account}`);
        result = await resetVoting(contract, account);
      } else if (onResetVoting) {
        result = await onResetVoting();
      } else {
        throw new Error('Method not available');
      }
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      console.error('Error resetting voting:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Error resetting voting. See console for details.' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Check how we should load data - direct or via handlers
      if (useDirectWeb3) {
        console.log(`AdminPanel: Loading data directly with contract and account ${account}`);
        
        const [requests, status] = await Promise.all([
          getRegistrationRequests(contract, account as string),
          getVotingStatus(contract)
        ]);
        
        setRegistrationRequests(requests);
        setVotingStatus(status);
      } else if (onGetRequests) {
        console.log('AdminPanel: Loading data via handler functions');
        const requests = await onGetRequests();
        setRegistrationRequests(requests);
        
        // Using external voting status if available
        if (externalVotingStatus) {
          setVotingStatus(externalVotingStatus);
        }
      } else {
        console.warn('AdminPanel: Cannot load data - missing contract/account or handler functions'); 
        setMessage({ 
          type: 'error', 
          text: 'Configuration error. Please contact support.' 
        });
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load data. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!candidateName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a candidate name' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      let result;
      
      if (useDirectWeb3) {
        console.log(`Adding candidate "${candidateName}" with account: ${account}`);
        result = await addCandidate(contract, account as string, candidateName);
      } else if (onAddCandidate) {
        result = await onAddCandidate(candidateName);
      } else {
        throw new Error('Method not available');
      }
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setCandidateName('');
        await loadData(); // Refresh data after successful action
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      console.error('Error adding candidate:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Error adding candidate. See console for details.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVoter = async (address: string) => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      let result;
      
      if (useDirectWeb3) {
        console.log(`Approving voter ${address} with account: ${account}`);
        result = await approveVoter(contract, account as string, address);
      } else if (onApproveVoter) {
        result = await onApproveVoter(address);
      } else {
        throw new Error('Method not available');
      }
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      console.error('Error approving voter:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Error approving voter. See console for details.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectVoter = async (address: string) => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      let result;
      
      if (useDirectWeb3) {
        console.log(`Rejecting voter ${address} with account: ${account}`);
        result = await rejectVoter(contract, account as string, address);
      } else if (onRejectVoter) {
        result = await onRejectVoter(address);
      } else {
        throw new Error('Method not available');
      }
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      console.error('Error rejecting voter:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Error rejecting voter. See console for details.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartVoting = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      let result;
      
      if (useDirectWeb3) {
        console.log(`Starting voting with account: ${account}`);
        result = await startVoting(contract, account as string);
      } else if (onStartVoting) {
        result = await onStartVoting();
      } else {
        throw new Error('Method not available');
      }
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      console.error('Error starting voting:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Error starting voting. See console for details.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndVoting = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      let result;
      
      if (useDirectWeb3) {
        console.log(`Ending voting with account: ${account}`);
        result = await endVoting(contract, account as string);
      } else if (onEndVoting) {
        result = await onEndVoting();
      } else {
        throw new Error('Method not available');
      }
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      console.error('Error ending voting:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Error ending voting. See console for details.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRequests = async () => {
    try {
      setIsLoading(true);
      
      if (useDirectWeb3) {
        console.log(`Fetching registration requests with account: ${account}`);
        const requests = await getRegistrationRequests(contract, account as string);
        setRegistrationRequests(requests);
      } else if (onGetRequests) {
        const requests = await onGetRequests();
        setRegistrationRequests(requests);
      } else {
        throw new Error('Method not available');
      }
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Error fetching registration requests'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Update internal voting status if external changes
    if (externalVotingStatus) {
      setVotingStatus(externalVotingStatus);
    }
  }, [externalVotingStatus]);

  useEffect(() => {
    if (useDirectWeb3) {
      console.log(`AdminPanel: Loading data with account ${account}`);
      loadData();
    } else if (onGetRequests) {
      console.log('AdminPanel: Using handler functions');
      loadData();
    } else {
      console.warn(`AdminPanel: Missing contract/account or handler functions`);
      setIsInitialized(true); // Mark as initialized even if we can't load data
    }
  }, [contract, account, onGetRequests]);

  // If we're not initialized yet, show loading
  if (!isInitialized && isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
      
      {message.text && (
        <div className={`p-4 rounded mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Add Reset Voting button if voting has ended */}
      {votingStatus.isStarted && votingStatus.isEnded && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Reset Voting</h3>
          <p className="text-sm text-gray-600 mb-4">
            This will reset the voting process, allowing you to start a new voting session.
            All candidate data will be preserved, but all votes will be reset.
          </p>
          <button
            onClick={handleResetVoting}
            disabled={isLoading || !votingStatus.isEnded}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Reset Voting'}
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Candidate</h3>
          <div className="mb-4">
            <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-1">
              Candidate Name
            </label>
            <input
              type="text"
              id="candidateName"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter candidate name"
            />
          </div>
          <button
            onClick={handleAddCandidate}
            disabled={isLoading || !candidateName.trim() || (votingStatus.isStarted && !votingStatus.isEnded)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Add Candidate'}
          </button>
          
          {votingStatus.isStarted && !votingStatus.isEnded && (
            <p className="text-sm text-yellow-600 mt-2">
              Candidates cannot be added while voting is active.
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Voting Control</h3>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleStartVoting}
              disabled={isLoading || (votingStatus.isStarted && !votingStatus.isEnded)}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 flex-1"
            >
              {isLoading ? 'Processing...' : 'Start Voting'}
            </button>
            <button
              onClick={handleEndVoting}
              disabled={isLoading || !votingStatus.isStarted || votingStatus.isEnded}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 flex-1"
            >
              {isLoading ? 'Processing...' : 'End Voting'}
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm">
              Current Status: 
              {votingStatus.isStarted && !votingStatus.isEnded && (
                <span className="text-green-600 font-medium"> Voting Active</span>
              )}
              {votingStatus.isStarted && votingStatus.isEnded && (
                <span className="text-red-600 font-medium"> Voting Ended</span>
              )}
              {!votingStatus.isStarted && (
                <span className="text-yellow-600 font-medium"> Not Started</span>
              )}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Registration Requests</h3>
          <button
            onClick={handleGetRequests}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Requests
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : registrationRequests.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {registrationRequests.map((address) => (
              <li key={address} className="py-4 flex items-center justify-between">
                <div className="font-mono text-sm">{address}</div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleApproveVoter(address)}
                    disabled={isLoading}
                    className="bg-green-100 hover:bg-green-200 text-green-800 py-1 px-3 rounded text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectVoter(address)}
                    disabled={isLoading}
                    className="bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded text-sm"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 py-4">No pending registration requests.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;