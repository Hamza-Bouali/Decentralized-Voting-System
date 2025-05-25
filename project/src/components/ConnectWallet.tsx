import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Wallet } from 'lucide-react';

interface ConnectWalletProps {
  onConnect: () => void;
  error: string | null;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect, error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-blue-100 p-4">
      <Card className="max-w-md w-full mx-auto text-center">
        <div className="py-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Wallet className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Voting DApp</h1>
          <p className="text-gray-600 mb-8">Connect your wallet to participate in the voting process</p>
          
          <Button
            onClick={onConnect}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Connect MetaMask
          </Button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <p className="mt-6 text-xs text-gray-500">
            Make sure you have MetaMask installed and you're connected to the correct network.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ConnectWallet;