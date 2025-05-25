export interface Candidate {
  id: string;
  name: string;
  voteCount: string;
}

export interface Voter {
  isRegistered: boolean;
  hasVoted: boolean;
  vote: string;
  hasRequested: boolean;
}

export interface Web3State {
  web3: any;
  contract: any;
  account: string;
  isAdmin: boolean;
  isConnected: boolean;
  error: string | null;
}

export interface VotingState {
  isStarted: boolean;
  isEnded: boolean;
}