import { useEffect, useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import AccountInfo from './components/AccountInfo';
import CandidateList from './components/CandidateList';
import VoterPanel from './components/VoterPanel';
import AdminPanel from './components/AdminPanel';
import Dashboard from './pages/Dashboard';
import { Candidate, Voter, Web3State, VotingState, ActionResult, Contract } from './types';
import { 
  initializeWeb3,
  checkIfAdmin,
  getVoterStatus,
  getVotingStatus,
  getCandidates,
  requestRegistration,
  voteForCandidate,
  getWinner,
  addCandidate,
  approveVoter,
  rejectVoter,
  startVoting,
  endVoting,
  getRegistrationRequests,
  resetVoting
} from './lib/web3';

// Extend CandidateListProps interface for the isLoading prop
interface ExtendedCandidateListProps {
  candidates: Candidate[];
  totalVotes: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

function App() {
  const [web3State, setWeb3State] = useState<Web3State>({
    web3: null,
    contract: null,
    account: '',
    isAdmin: false,
    isConnected: false,
    error: null
  });

  const [voter, setVoter] = useState<Voter>({
    isRegistered: false,
    hasVoted: false,
    vote: '0',
    hasRequested: false
  });

  const [votingStatus, setVotingStatus] = useState<VotingState>({
    isStarted: false,
    isEnded: false
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isCandidatesLoading, setIsCandidatesLoading] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  const [currentView, setCurrentView] = useState<'voter' | 'admin' | 'dashboard'>('voter');

  const handleResetVoting = async (): Promise<ActionResult> => {
    if (!web3State.contract || !web3State.account) return { success: false, message: 'Wallet not connected' };
  
    const result = await resetVoting(web3State.contract, web3State.account);
    if (result.success) {
      await handleRefreshStatus();
      await loadCandidates(); // Make sure we refresh candidate data too
    }
    return result;
  };

  useEffect(() => {
    const connectToWeb3 = async () => {
      try {
        const { web3, contract, account, error } = await initializeWeb3();
        if (web3 && contract && account) {
          const isAdmin = await checkIfAdmin(contract, account);
          setWeb3State({
            web3,
            contract,
            account,
            isAdmin,
            isConnected: true,
            error: null
          });

          await refreshData(contract, account);
        } else {
          setWeb3State(prevState => ({ ...prevState, error }));
        }
      } catch (error) {
        console.error('Failed to initialize Web3:', error);
        setWeb3State(prevState => ({ 
          ...prevState, 
          error: 'Failed to connect to blockchain. Please check your connection and try again.' 
        }));
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    connectToWeb3();

    return () => {
      // Cleanup event listeners if needed
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const refreshData = async (contract: Contract, account: string) => {
    try {
      const voterStatus = await getVoterStatus(contract, account);
      setVoter(voterStatus);

      const votingState = await getVotingStatus(contract);
      setVotingStatus(votingState);

      loadCandidates();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const { web3, contract, account, error } = await initializeWeb3();
      if (web3 && contract && account) {
        const isAdmin = await checkIfAdmin(contract, account);
        setWeb3State({
          web3,
          contract,
          account,
          isAdmin,
          isConnected: true,
          error: null
        });

        await refreshData(contract, account);
      } else {
        setWeb3State(prevState => ({ ...prevState, error }));
      }
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      setWeb3State(prevState => ({ 
        ...prevState, 
        error: 'Failed to connect to blockchain. Please check your connection and try again.' 
      }));
    }
  };

  const handleRefreshStatus = async () => {
    if (web3State.contract && web3State.account) {
      await refreshData(web3State.contract, web3State.account);
    }
  };

  const loadCandidates = async () => {
    if (!web3State.contract) return;
    
    setIsCandidatesLoading(true);
    try {
      const candidatesList = await getCandidates(web3State.contract);
      setCandidates(candidatesList);
      
      // Calculate total votes
      const totalVotesCount = candidatesList.reduce(
        (sum, candidate) => sum + parseInt(candidate.voteCount), 
        0
      );
      setTotalVotes(totalVotesCount);
      
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setIsCandidatesLoading(false);
    }
  };

  // These functions aren't used in this component, but they're kept for potential future use
  const handleRequestRegistration = async (): Promise<ActionResult> => {
    if (!web3State.contract || !web3State.account) return { success: false, message: 'Wallet not connected' };
    
    const result = await requestRegistration(web3State.contract, web3State.account);
    if (result.success) {
      await handleRefreshStatus();
    }
    return result;
  };

  const handleVote = async (candidateId: string): Promise<ActionResult> => {
    if (!web3State.contract || !web3State.account) return { success: false, message: 'Wallet not connected' };
    
    const result = await voteForCandidate(web3State.contract, web3State.account, candidateId);
    if (result.success) {
      await handleRefreshStatus();
      await loadCandidates();
    }
    return result;
  };

  const handleGetWinner = async (): Promise<string> => {
    if (!web3State.contract) return 'Wallet not connected';
    return await getWinner(web3State.contract);
  };

  const handleAddCandidate = async (name: string): Promise<ActionResult> => {
    if (!web3State.contract || !web3State.account) return { success: false, message: 'Wallet not connected' };
    
    const result = await addCandidate(web3State.contract, web3State.account, name);
    if (result.success) {
      await loadCandidates();
    }
    return result;
  };

  const handleApproveVoter = async (address: string): Promise<ActionResult> => {
    if (!web3State.contract || !web3State.account) return { success: false, message: 'Wallet not connected' };
    return await approveVoter(web3State.contract, web3State.account, address);
  };

  const handleRejectVoter = async (address: string): Promise<ActionResult> => {
    if (!web3State.contract || !web3State.account) return { success: false, message: 'Wallet not connected' };
    return await rejectVoter(web3State.contract, web3State.account, address);
  };

  const handleStartVoting = async (): Promise<ActionResult> => {
    if (!web3State.contract || !web3State.account) return { success: false, message: 'Wallet not connected' };
    
    const result = await startVoting(web3State.contract, web3State.account);
    if (result.success) {
      await handleRefreshStatus();
    }
    return result;
  };

  const handleEndVoting = async (): Promise<ActionResult> => {
    if (!web3State.contract || !web3State.account) return { success: false, message: 'Wallet not connected' };
    
    const result = await endVoting(web3State.contract, web3State.account);
    if (result.success) {
      await handleRefreshStatus();
    }
    return result;
  };

  const handleGetRequests = async (): Promise<string[]> => {
    if (!web3State.contract || !web3State.account) return [];
    return await getRegistrationRequests(web3State.contract, web3State.account);
  };

  // Destructure fields omitting error since we handle it differently
  const { contract, account, isAdmin } = web3State;

  if (!web3State.isConnected) {
    return <ConnectWallet onConnect={handleConnect} error={web3State.error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">Voting DApp</h1>
          <p className="text-gray-600">A decentralized application for secure and transparent voting</p>
        </header>

        <nav className="bg-white shadow-md mb-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Voting DApp</h1>
              </div>
              
              <div className="flex items-center">
                <button 
                  onClick={() => setCurrentView('dashboard')} 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'dashboard' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                
                <button 
                  onClick={() => setCurrentView('voter')} 
                  className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'voter' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Voter Panel
                </button>
                
                {web3State.isAdmin && (
                  <button 
                    onClick={() => setCurrentView('admin')} 
                    className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'admin' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Admin Panel
                  </button>
                )}
                
                <div className="ml-6 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-800">
                  {web3State.account.substring(0, 6)}...{web3State.account.substring(web3State.account.length - 4)}
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <AccountInfo
              account={web3State.account}
              isAdmin={web3State.isAdmin}
              voter={voter}
              votingStatus={votingStatus}
              onRefresh={handleRefreshStatus}
            />
            
            <CandidateList
              candidates={candidates}
              totalVotes={totalVotes}
              onRefresh={loadCandidates}
              isLoading={isCandidatesLoading}
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="container mx-auto px-4 py-8">
              {currentView === 'dashboard' && (
                <Dashboard />
              )}
              
              {currentView === 'voter' && (
                <VoterPanel 
                  contract={contract} 
                  account={account} 
                />
              )}
              
              {currentView === 'admin' && isAdmin && (
                <AdminPanel 
                  contract={contract} 
                  account={account}
                  onResetVoting={handleResetVoting}
                  // Fallback handlers in case direct Web3 access fails
                  onAddCandidate={handleAddCandidate}
                  onApproveVoter={handleApproveVoter}
                  onRejectVoter={handleRejectVoter}
                  onStartVoting={handleStartVoting}
                  onEndVoting={handleEndVoting}
                  onGetRequests={handleGetRequests}
                  votingStatus={votingStatus}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;