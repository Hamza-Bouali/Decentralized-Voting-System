/**
 * Types for Voting DApp
 */

// Basic Web3 related types
declare interface Web3State {
  web3: any | null;
  contract: any | null;
  account: string;
  error: string | null;
}

// Candidate related types
declare interface Candidate {
  id: string;
  name: string;
  voteCount: string;
}

// Voter related types
declare interface Voter {
  isRegistered: boolean;
  hasVoted: boolean;
  vote: string;
  hasRequested: boolean;
}

// Voting status
declare interface VotingStatus {
  isStarted: boolean;
  isEnded: boolean;
}

// Function result type
declare interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

// Extend Window object for Ethereum
declare interface Window {
  ethereum?: any;
}
