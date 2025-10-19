'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import blockchainService from '@/services/blockchain';
import { SUCCESS_MESSAGES } from '@/utils/constants';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Connect wallet (MetaMask)
   */
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await blockchainService.connectWallet();

      setAccount(result.account);
      setChainId(result.chainId);

      // Store wallet address
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexus_wallet_address', result.account);
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.WALLET_CONNECTED,
        account: result.account,
        chainId: result.chainId
      };
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    blockchainService.disconnect();
    setAccount(null);
    setChainId(null);
    setError(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexus_wallet_address');
    }
  }, []);

  /**
   * Register product on blockchain
   * @param {string} name - Product name
   * @param {string} batchNumber - Batch number
   */
  const registerProduct = useCallback(async (name, batchNumber) => {
    try {
      setLoading(true);
      setError(null);

      const result = await blockchainService.registerProduct(name, batchNumber);

      return {
        success: true,
        productId: result.productId,
        txHash: result.txHash
      };
    } catch (error) {
      console.error('Product registration error:', error);
      setError(error.message || 'Failed to register product');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add checkpoint on blockchain
   * @param {number} productId - Blockchain product ID
   * @param {string} location - Location description
   * @param {number} status - Status enum
   * @param {string} notes - Additional notes
   * @param {number} temperature - Temperature in Celsius
   */
  const addCheckpoint = useCallback(async (productId, location, status, notes, temperature) => {
    try {
      setLoading(true);
      setError(null);

      const result = await blockchainService.addCheckpoint(
        productId,
        location,
        status,
        notes,
        temperature
      );

      return {
        success: true,
        txHash: result.txHash
      };
    } catch (error) {
      console.error('Add checkpoint error:', error);
      setError(error.message || 'Failed to add checkpoint');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get product from blockchain
   * @param {number} productId - Blockchain product ID
   */
  const getProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);

      const product = await blockchainService.getProduct(productId);

      return {
        success: true,
        product
      };
    } catch (error) {
      console.error('Get product error:', error);
      setError(error.message || 'Failed to get product');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get checkpoints from blockchain
   * @param {number} productId - Blockchain product ID
   */
  const getCheckpoints = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);

      const checkpoints = await blockchainService.getCheckpoints(productId);

      return {
        success: true,
        checkpoints
      };
    } catch (error) {
      console.error('Get checkpoints error:', error);
      setError(error.message || 'Failed to get checkpoints');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Switch to Sepolia network
   */
  const switchToSepolia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await blockchainService.switchToSepolia();

      return { success: true };
    } catch (error) {
      console.error('Network switch error:', error);
      setError(error.message || 'Failed to switch network');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    account,
    chainId,
    loading,
    error,
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
    registerProduct,
    addCheckpoint,
    getProduct,
    getCheckpoints,
    switchToSepolia,
    blockchainService // Expose service for advanced usage
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

/**
 * Custom hook to use Web3 context
 */
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
}

export default Web3Context;
