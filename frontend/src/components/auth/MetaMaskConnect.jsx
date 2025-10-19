'use client';

import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAuth } from '@/contexts/AuthContext';
import { Button, ErrorMessage } from '@/components/common';
import { Wallet } from 'lucide-react';
import { truncateAddress } from '@/utils/truncate';

/**
 * MetaMask Wallet Connection Component
 */
export default function MetaMaskConnect({ showLabel = true, variant = 'outline', size = 'md' }) {
  const { isConnected, account, connectWallet, disconnectWallet, loading, error } = useWeb3();
  const { updateUser } = useAuth();
  const [localError, setLocalError] = useState('');

  const handleConnect = async () => {
    try {
      setLocalError('');
      const result = await connectWallet();

      // Update user with wallet address if logged in
      if (updateUser) {
        updateUser({ walletAddress: result.account });
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    if (updateUser) {
      updateUser({ walletAddress: null });
    }
  };

  if (isConnected) {
    return (
      <div className="space-y-2">
        {showLabel && (
          <p className="text-sm font-medium text-gray-700">Connected Wallet</p>
        )}
        <div className="flex items-center gap-2">
          <div className="flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono text-gray-900">
                {truncateAddress(account)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <p className="text-sm font-medium text-gray-700">Connect Wallet (Optional)</p>
      )}
      {(error || localError) && (
        <ErrorMessage message={error || localError} />
      )}
      <Button
        variant={variant}
        size={size}
        onClick={handleConnect}
        loading={loading}
        fullWidth
      >
        <Wallet className="h-5 w-5 mr-2" />
        {loading ? 'Connecting...' : 'Connect MetaMask'}
      </Button>
    </div>
  );
}
