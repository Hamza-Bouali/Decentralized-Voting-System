import React, { useEffect, useState, useRef } from 'react';
import { getCandidates, getVotingStatus } from '../lib/web3';
import { Chart, registerables } from 'chart.js';

// Register all the components needed
Chart.register(...registerables);

interface Candidate {
  id: string;
  name: string;
  voteCount: string;
}

interface VotingDashboardProps {
  contract: any;
  refreshInterval?: number; // in ms
}

const VotingDashboard: React.FC<VotingDashboardProps> = ({ 
  contract, 
  refreshInterval = 5000 
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingStatus, setVotingStatus] = useState({ isStarted: false, isEnded: false });
  const [totalVotes, setTotalVotes] = useState(0);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const fetchData = async () => {
    try {
      if (!contract) {
        throw new Error("Contract is not initialized");
      }
      
      // Get candidates
      const candidatesData = await getCandidates(contract);
      setCandidates(candidatesData);
      
      // Calculate total votes
      const totalVotesCount = candidatesData.reduce(
        (sum, candidate) => sum + parseInt(candidate.voteCount), 
        0
      );
      setTotalVotes(totalVotesCount);
      
      // Get voting status
      const status = await getVotingStatus(contract);
      setVotingStatus(status);
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch voting data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchData();
    
    // Set up polling for updates
    const interval = setInterval(fetchData, refreshInterval);
    
    // Clean up
    return () => clearInterval(interval);
  }, [contract, refreshInterval]);

  useEffect(() => {
    // Create or update chart when candidates data changes
    if (candidates.length > 0 && chartRef.current) {
      if (chartInstance.current) {
        // Destroy existing chart if it exists
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: candidates.map(c => `${c.name} (ID: ${c.id})`),
            datasets: [{
              label: 'Votes',
              data: candidates.map(c => parseInt(c.voteCount)),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(199, 199, 199, 0.6)'
              ],
              borderColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)',
                'rgb(199, 199, 199)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0 // Only show integer values for vote counts
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Candidate Vote Distribution',
                font: {
                  size: 16
                }
              }
            }
          }
        });
      }
    }
  }, [candidates]);

  const renderVotingStatus = () => {
    if (votingStatus.isStarted && !votingStatus.isEnded) {
      return <span className="text-green-600 font-medium">Voting is active</span>;
    } else if (votingStatus.isStarted && votingStatus.isEnded) {
      return <span className="text-red-600 font-medium">Voting has ended</span>;
    } else {
      return <span className="text-yellow-600 font-medium">Voting has not started</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Voting Dashboard</h2>
        <div className="text-sm">
          Status: {renderVotingStatus()} • 
          <span className="ml-2">Total Votes: <strong>{totalVotes}</strong></span>
        </div>
      </div>
      
      {candidates.length > 0 ? (
        <div>
          <div className="mb-6">
            <canvas ref={chartRef} height="300"></canvas>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-gray-50 rounded-md p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">{candidate.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    ID: {candidate.id}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ 
                        width: `${totalVotes > 0 
                          ? (parseInt(candidate.voteCount) / totalVotes * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{candidate.voteCount} votes</span>
                    <span>
                      {totalVotes > 0 
                        ? Math.round(parseInt(candidate.voteCount) / totalVotes * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates</h3>
          <p className="mt-1 text-sm text-gray-500">No candidates have been added yet.</p>
        </div>
      )}
    </div>
  );
};

export default VotingDashboard;
