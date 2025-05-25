import React, { useState, useEffect } from 'react';
import { 
  addCandidate, 
  approveVoter, 
  rejectVoter, 
  startVoting, 
  endVoting,
  getRegistrationRequests,
  getVotingStatus
} from '../lib/web3';

interface AdminPanelProps {
  contract: any;
  account: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ contract, account }) => {
  const [candidateName, setCandidateName] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  const [registrationRequests, setRegistrationRequests] = useState<string[]>([]);
  const [votingStatus, setVotingStatus] = useState({ isStarted: false, isEnded: false });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contract && account) {
      loadData();
    }
  }, [contract, account]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [requests, status] = await Promise.all([
        getRegistrationRequests(contract, account),
        getVotingStatus(contract)
      ]);
      
      setRegistrationRequests(requests);
      setVotingStatus(status);
    } catch (err) {
      console.error('Error loading admin data:', err);
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
      
      const result = await addCandidate(contract, account, candidateName);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setCandidateName('');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error adding candidate:', err);
      setMessage({ type: 'error', text: 'Error adding candidate. See console for details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVoter = async (address: string) => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await approveVoter(contract, account, address);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error approving voter:', err);
      setMessage({ type: 'error', text: 'Error approving voter. See console for details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectVoter = async (address: string) => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await rejectVoter(contract, account, address);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error rejecting voter:', err);
      setMessage({ type: 'error', text: 'Error rejecting voter. See console for details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartVoting = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await startVoting(contract, account);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error starting voting:', err);
      setMessage({ type: 'error', text: 'Error starting voting. See console for details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndVoting = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await endVoting(contract, account);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error ending voting:', err);
      setMessage({ type: 'error', text: 'Error ending voting. See console for details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await getRegistrationRequests(contract, account);
      setRegistrationRequests(requests);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

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