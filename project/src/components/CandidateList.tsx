import React from 'react';
import { Candidate } from '../types'; // Adjust the import path as necessary

interface CandidateListProps {
  candidates: Candidate[];
  totalVotes: number;
  onRefresh: () => void;
  isLoading?: boolean; // Make isLoading optional
}

const CandidateList: React.FC<CandidateListProps> = ({ 
  candidates, 
  totalVotes,
  onRefresh,
  isLoading = false // Default to false if not provided 
}) => {
  const sortedCandidates = [...candidates].sort((a, b) => 
    parseInt(b.voteCount) - parseInt(a.voteCount)
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Candidate Rankings</h2>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading candidates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Candidate Rankings</h2>
        <button 
          onClick={onRefresh}
          className="p-2 rounded-full hover:bg-gray-100"
          title="Refresh candidate data"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        {candidates.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No candidates found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCandidates.map((candidate, index) => {
                const percentage = totalVotes > 0 
                  ? Math.round((parseInt(candidate.voteCount) / totalVotes) * 100) 
                  : 0;
                  
                // Determine the color based on rank
                let rankClass = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
                if (index === 0) rankClass += " bg-green-100 text-green-800";
                else if (index === 1) rankClass += " bg-blue-100 text-blue-800";
                else if (index === 2) rankClass += " bg-yellow-100 text-yellow-800";
                else rankClass += " bg-gray-100 text-gray-800";
                
                return (
                  <tr key={candidate.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={rankClass}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.voteCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{percentage}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CandidateList;