import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import VotingDashboard from '../components/VotingDashboard';
import VotingPieChart from '../components/VotingPieChart';
import CandidateList from '../components/CandidateList';
import { getCandidates, getVotingStatus } from '../lib/web3';

interface Candidate {
  id: string;
  name: string;
  voteCount: string;
}

const Dashboard: React.FC = () => {
  const { contract, account, isAdmin, isLoading: web3Loading } = useWeb3();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [votingStatus, setVotingStatus] = useState({ isStarted: false, isEnded: false });
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      if (!contract) {
        throw new Error("Contract is not initialized");
      }
      
      const [candidatesData, status] = await Promise.all([
        getCandidates(contract),
        getVotingStatus(contract)
      ]);
      
      setCandidates(candidatesData);
      setVotingStatus(status);
      
      const totalVotesCount = candidatesData.reduce(
        (sum, candidate) => sum + parseInt(candidate.voteCount), 
        0
      );
      setTotalVotes(totalVotesCount);
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch voting data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchData();
    }
  }, [contract]);
  
  const handleRefresh = () => {
    fetchData();
  };

  if (web3Loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to blockchain...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>Failed to connect to the contract. Please make sure MetaMask is installed and connected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Voting Dashboard</h1>
        <div className="flex items-center mt-2">
          <span className="text-sm text-gray-500">
            Connected as: <span className="font-mono text-gray-700">{account}</span>
          </span>
          {isAdmin && (
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Admin
            </span>
          )}
        </div>
        <div className="mt-1">
          <button 
            onClick={handleRefresh} 
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </header>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Vote Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Voting Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    votingStatus.isStarted && !votingStatus.isEnded
                      ? "text-green-600" 
                      : votingStatus.isEnded 
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}>
                    {votingStatus.isStarted && !votingStatus.isEnded 
                      ? "Voting Active" 
                      : votingStatus.isEnded 
                        ? "Voting Ended"
                        : "Not Started"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Votes:</span>
                  <span className="font-medium">{totalVotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Candidates:</span>
                  <span className="font-medium">{candidates.length}</span>
                </div>
              </div>
            </div>
            
            {/* Vote Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Vote Distribution</h3>
              {candidates.length > 0 ? (
                <VotingPieChart candidates={candidates} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No candidates available
                </div>
              )}
            </div>
          </div>
          
          {/* Candidate Rankings Table */}
          <CandidateList 
            candidates={candidates}
            totalVotes={totalVotes}
            onRefresh={handleRefresh}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
