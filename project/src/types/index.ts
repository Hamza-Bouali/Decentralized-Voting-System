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

// Additional types from types.d.ts
export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

// For better TypeScript integration
export interface Window {
  ethereum?: any;
}

// Contract interface for better type safety
export interface Contract {
  methods: {
    getRegistrationRequests(): {
      call(options: { from: string }): Promise<string[]>;
    };
    addCandidate(name: string): {
      send(options: { from: string }): Promise<any>;
    };
    approveVoter(voterAddress: string): {
      send(options: { from: string }): Promise<any>;
    };
    rejectVoterRequest(voterAddress: string): {
      send(options: { from: string }): Promise<any>;
    };
    startVoting(): {
      send(options: { from: string }): Promise<any>;
    };
    endVoting(): {
      send(options: { from: string }): Promise<any>;
    };
    resetVoting(): {
      send(options: { from: string }): Promise<any>;
    };
    owner(): {
      call(options?: { from: string }): Promise<string>;
    };
    voters(address: string): {
      call(): Promise<Voter>;
    };
    votingStarted(): {
      call(): Promise<boolean>;
    };
    votingEnded(): {
      call(): Promise<boolean>;
    };
    candidatesCount(): {
      call(): Promise<string>;
    };
    candidates(id: number): {
      call(): Promise<Candidate>;
    };
    vote(candidateId: string): {
      send(options: { from: string }): Promise<any>;
    };
    requestVoterRegistration(): {
      send(options: { from: string }): Promise<any>;
    };
    getWinner(): {
      call(): Promise<string>;
    };
  };
}