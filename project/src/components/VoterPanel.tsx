import React, { useState, useEffect } from 'react';
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
    hasRequested: false
  });
  const [votingStatus, setVotingStatus] = useState({
    isStarted: false,
    isEnded: false
  });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
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
      const [status, voting, candidateList] = await Promise.all([
        getVoterStatus(contract, account),
        getVotingStatus(contract),
        getCandidates(contract)
      ]);

      setVoterStatus(status);
      setVotingStatus(voting);
      setCandidates(candidateList);
    } catch (err) {
      console.error('Error loading voter data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRegistration = async () => {
    if (!contract || !account) return;

    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await requestRegistration(contract, account);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error requesting registration:', err);
      setMessage({ type: 'error', text: 'Error requesting registration. See console for details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!contract || !account || !selectedCandidate) return;

    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await voteForCandidate(contract, account, selectedCandidate);
      
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
          <div className="mb-6">
            <button 
              onClick={handleRequestRegistration}
              disabled={isLoading || voterStatus.hasRequested}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Request Registration'}
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
            <p>You voted for candidate with ID: {voterStatus.vote}</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="candidate" className="block text-sm font-medium text-gray-700 mb-1">
                Select Candidate
              </label>
              <select
                id="candidate"
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                disabled={!votingStatus.isStarted || votingStatus.isEnded || !voterStatus.isRegistered || isLoading}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a candidate</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    ID {candidate.id}: {candidate.name} ({candidate.voteCount} votes)
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleVote}
              disabled={
                !selectedCandidate || 
                isLoading || 
                !voterStatus.isRegistered || 
                !votingStatus.isStarted || 
                votingStatus.isEnded
              }
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Cast Vote'}
            </button>
            
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