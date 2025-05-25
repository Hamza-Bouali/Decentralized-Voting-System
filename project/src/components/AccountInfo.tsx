import React from 'react';
import { Wallet, UserCheck, Vote, Clock } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Voter, VotingState } from '../types';

interface AccountInfoProps {
  account: string;
  isAdmin: boolean;
  voter: Voter;
  votingStatus: VotingState;
  onRefresh: () => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ 
  account, 
  isAdmin, 
  voter, 
  votingStatus,
  onRefresh 
}) => {
  const getVoterStatusText = () => {
    let status = [];
    if (voter.isRegistered) status.push("Registered");
    if (voter.hasRequested) status.push("Requested");
    if (voter.hasVoted) status.push("Voted");
    return status.length > 0 ? status.join(" | ") : "Not registered";
  };

  const getVotingStatusText = () => {
    if (votingStatus.isStarted && !votingStatus.isEnded) {
      return "Voting is ongoing";
    } else if (votingStatus.isStarted && votingStatus.isEnded) {
      return "Voting has ended";
    } else {
      return "Voting has not started";
    }
  };

  const formatAccount = (address: string) => {
    if (address.length < 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Card title="Account Info" className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="space-y-2">
        <div className="flex items-center">
          <Wallet className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-sm">
            <span className="font-medium">Connected Account:</span>{" "}
            <span className="font-mono">{formatAccount(account)}</span>
          </p>
        </div>
        
        <div className="flex items-center">
          <UserCheck className="h-5 w-5 text-indigo-600 mr-2" />
          <p className="text-sm">
            <span className="font-medium">Role:</span>{" "}
            <span className={`${isAdmin ? "text-purple-600 font-semibold" : "text-gray-600"}`}>
              {isAdmin ? "Admin" : "Voter"}
            </span>
          </p>
        </div>
        
        <div className="flex items-center">
          <Vote className="h-5 w-5 text-emerald-600 mr-2" />
          <p className="text-sm">
            <span className="font-medium">Voter Status:</span>{" "}
            <span className="text-gray-600">{getVoterStatusText()}</span>
          </p>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-amber-600 mr-2" />
          <p className="text-sm">
            <span className="font-medium">Voting Status:</span>{" "}
            <span className={`
              ${votingStatus.isStarted && !votingStatus.isEnded ? "text-emerald-600 font-semibold" : ""} 
              ${votingStatus.isStarted && votingStatus.isEnded ? "text-red-600 font-semibold" : ""}
              ${!votingStatus.isStarted ? "text-gray-600" : ""}
            `}>
              {getVotingStatusText()}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Button 
          onClick={onRefresh} 
          variant="info" 
          size="sm"
          className="text-white"
        >
          Refresh Status
        </Button>
      </div>
    </Card>
  );
};

export default AccountInfo;