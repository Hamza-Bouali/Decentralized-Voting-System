import React, { useState, useEffect, useCallback } from 'react';
import { 
  getVoterStatus, 
  requestRegistration, 
  voteForCandidate,
  getCandidates,
  getVotingStatus
} from '../lib/web3';

interface VoterPanelProps {
  contract: any;
  account: string;
}

const VoterPanel: React.FC<VoterPanelProps> = ({ contract, account }) => {
  const [voterStatus, setVoterStatus] = useState({
    isRegistered: false,
    hasVoted: false,
    vote: '0',
    hasRequested: false,
    cin: ''
  });
  const [votingStatus, setVotingStatus] = useState({
    isStarted: false,
    isEnded: false
  });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [cin, setCin] = useState('');

  // Track candidate data is loading
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadingCandidates(true); // Set loading state for candidates
      
      const [status, voting, candidateList] = await Promise.all([
        getVoterStatus(contract, account),
        getVotingStatus(contract),
        getCandidates(contract)
      ]);

      setVoterStatus(status);
      setVotingStatus(voting);
      
      // Important: Convert BigInt values to strings before setting state
      const processedCandidates = candidateList.map(candidate => ({
        ...candidate,
        id: candidate.id.toString(), // Ensure id is a string
        voteCount: candidate.voteCount.toString() // Ensure voteCount is a string
      }));
      
      setCandidates(processedCandidates);
      console.log('Loaded candidates after processing:', processedCandidates);
      
      // Reset selected candidate if not valid
      if (selectedCandidate) {
        const candidateExists = processedCandidates.some(c => c.id === selectedCandidate);
        if (!candidateExists) {
          console.log('Selected candidate no longer exists, resetting selection');
          setSelectedCandidate('');
        }
      }
    } catch (err) {
      console.error('Error loading voter data:', err);
    } finally {
      setIsLoading(false);
      setLoadingCandidates(false);
    }
  }, [contract, account, selectedCandidate]);

  useEffect(() => {
    if (contract && account) {
      loadData();
    }
  }, [contract, account, loadData]);

  const handleRequestRegistration = async () => {
    if (!contract || !account) return;
    
    // Validate CIN format
    if (!cin.trim()) {
      setMessage({ type: 'error', text: 'Please enter your CIN number' });
      return;
    }

    // Basic CIN format validation (adjust according to your CIN format requirements)
    const cinRegex = /^[A-Z0-9]{7,}$/; // Example: At least 8 alphanumeric characters
    if (!cinRegex.test(cin)) {
      setMessage({ 
        type: 'error', 
        text: 'Please enter a valid CIN number (at least 7 alphanumeric characters)' 
      });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await requestRegistration(contract, account, cin);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error requesting registration:', err);
      setMessage({ 
        type: 'error', 
        text: 'Error requesting registration. Please try again or contact support if the problem persists.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCandidateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log(`Candidate selected - value type: ${typeof value}, value: "${value}"`);
    setSelectedCandidate(value);
    
    // Verify the selection worked by logging the state after update
    setTimeout(() => {
      console.log('Updated selectedCandidate state:', selectedCandidate);
    }, 0);
    
    // Clear any error messages when the user makes a selection
    if (message.type === 'error' && message.text.includes('select a candidate')) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleVote = async () => {
    // Log current state before validation
    console.log("Current state before voting:", {
      selectedCandidate,
      candidatesCount: candidates.length,
      candidateIds: candidates.map(c => c.id)
    });
    
    // Add extensive validation and logging
    if (!contract) {
      console.error("Cannot vote: Contract is not available");
      setMessage({ type: 'error', text: 'Contract connection error' });
      return;
    }
    
    if (!account) {
      console.error("Cannot vote: Account is not available");
      setMessage({ type: 'error', text: 'Wallet account not connected' });
      return;
    }
    
    if (!selectedCandidate || selectedCandidate === "") {
      console.error("Cannot vote: No candidate selected", { selectedCandidate });
      setMessage({ type: 'error', text: 'Please select a candidate before voting' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      // Log the actual candidate ID being sent
      console.log(`Attempting to vote for candidate ID: ${selectedCandidate}`);
      
      // Verify the candidate exists before trying to vote
      const candidateExists = candidates.some(c => c.id === selectedCandidate);
      if (!candidateExists) {
        console.error(`Candidate with ID ${selectedCandidate} not found in list:`, candidates);
        setMessage({ type: 'error', text: `Selected candidate (ID: ${selectedCandidate}) not found` });
        setIsLoading(false);
        return;
      }
      
      const result = await voteForCandidate(contract, account, selectedCandidate);
      console.log("Vote result:", result);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error voting:', err);
      setMessage({ type: 'error', text: 'Error casting vote. See console for details.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get the candidate name by ID for display
  const getCandidateName = (id: string) => {
    const candidate = candidates.find(c => c.id === id);
    return candidate ? candidate.name : `Unknown (ID: ${id})`;
  };

  const renderVoterStatusBadge = () => {
    if (voterStatus.isRegistered) {
      if (voterStatus.hasVoted) {
        return (
          <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
            Voted
          </span>
        );
      }
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
          Registered
        </span>
      );
    }
    
    if (voterStatus.hasRequested) {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
          Registration Pending
        </span>
      );
    }
    
    return (
      <span className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
        Not Registered
      </span>
    );
  };

  const renderVotingStatusBadge = () => {
    if (votingStatus.isStarted && !votingStatus.isEnded) {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
          Voting Active
        </span>
      );
    }
    
    if (votingStatus.isStarted && votingStatus.isEnded) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
          Voting Ended
        </span>
      );
    }
    
    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
        Voting Not Started
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Voter Panel</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Status</h3>
        
        <div className="flex items-center mb-4">
          <div className="mr-4">
            {renderVoterStatusBadge()}
            {renderVotingStatusBadge()}
          </div>
          <button
            onClick={loadData}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Status
          </button>
        </div>
        
        {!voterStatus.isRegistered && !voterStatus.hasRequested && (
          <div className="mt-4">
            <div className="mb-4">
              <label htmlFor="cin" className="block text-sm font-medium text-gray-700 mb-1">
                CIN Number
              </label>
              <input
                type="text"
                id="cin"
                value={cin}
                onChange={(e) => {
                  setCin(e.target.value.toUpperCase()); // Convert to uppercase
                  // Clear error message when user starts typing
                  if (message.type === 'error') {
                    setMessage({ type: '', text: '' });
                  }
                }}
                className={`w-full px-3 py-2 border ${
                  message.type === 'error' ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter your CIN number"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Your CIN number must be at least 8 alphanumeric characters (letters and numbers only)
              </p>
            </div>
            <button
              onClick={handleRequestRegistration}
              disabled={isLoading || !cin.trim()}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Requesting...' : 'Request Registration'}
            </button>
          </div>
        )}
        
        {message.text && (
          <div className={`p-4 rounded mb-4 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cast Your Vote</h3>
        
        {voterStatus.hasVoted ? (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
            <p className="font-bold">You have already voted</p>
            <p>You voted for: {getCandidateName(voterStatus.vote)}</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="candidate" className="block text-sm font-medium text-gray-700 mb-1">
                Select Candidate
              </label>
              
              {/* Enhanced select component with better debugging */}
              <select
                id="candidate"
                value={selectedCandidate}
                onChange={handleCandidateChange}
                disabled={!votingStatus.isStarted || votingStatus.isEnded || !voterStatus.isRegistered || isLoading}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a candidate</option>
                {loadingCandidates ? (
                  <option value="" disabled>Loading candidates...</option>
                ) : candidates.length > 0 ? (
                  candidates.map((candidate) => {
                    // Add debug info to console
                    console.log(`Rendering candidate option: ID=${candidate.id}, name=${candidate.name}`);
                    return (
                      <option key={candidate.id} value={candidate.id.toString()}>
                        {candidate.name} (ID: {candidate.id}, Votes: {candidate.voteCount})
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>No candidates available</option>
                )}
              </select>
              
              {/* Display the currently selected candidate ID for debugging */}
              <div className="mt-2 p-2 bg-gray-50 rounded border text-sm">
                <p><strong>Debug info:</strong></p>
                <p>Selected candidate ID: "{selectedCandidate}"</p>
                <p>Type: {typeof selectedCandidate}</p>
                <p>Available IDs: {candidates.map(c => c.id).join(', ')}</p>
              </div>
            </div>
            
            <button
              onClick={handleVote}
              disabled={
                !selectedCandidate || 
                selectedCandidate === "" || 
                isLoading || 
                !voterStatus.isRegistered || 
                !votingStatus.isStarted || 
                votingStatus.isEnded
              }
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Cast Vote'}
            </button>
            
            {!selectedCandidate && (
              <p className="text-sm text-yellow-600 mt-2">
                Please select a candidate to vote for.
              </p>
            )}
            
            {!votingStatus.isStarted ? (
              <p className="text-sm text-yellow-600 mt-2">
                Voting has not started yet. Please wait for the admin to start the voting.
              </p>
            ) : votingStatus.isEnded ? (
              <p className="text-sm text-red-600 mt-2">
                Voting has ended.
              </p>
            ) : !voterStatus.isRegistered ? (
              <p className="text-sm text-yellow-600 mt-2">
                You need to be registered to vote.
              </p>
            ) : null}
          </>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Candidate List</h3>
        {candidates.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <li key={candidate.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">
                      {candidate.name}
                    </span>
                    <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      ID: {candidate.id}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {candidate.voteCount} votes
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No candidates available.</p>
        )}
      </div>
    </div>
  );
};

export default VoterPanel;