/**
 * Blockchain Service Layer
 * Web3 interaction using Ethers.js v6
 */

import { ethers } from 'ethers';
import { BLOCKCHAIN, ERROR_MESSAGES } from '@/utils/constants';
import ProductRegistryArtifact from '@/contracts/ProductRegistry.json';
import PaymentEscrowArtifact from '@/contracts/PaymentEscrow.json';

// Contract ABIs imported from deployed contracts
const ProductRegistryABI = ProductRegistryArtifact.abi;
const PaymentEscrowABI = PaymentEscrowArtifact.abi;

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
    this.productRegistry = null;
    this.paymentEscrow = null;
  }

  /**
   * Check if MetaMask is installed
   * @returns {boolean}
   */
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect wallet (MetaMask)
   * @returns {Promise<{account: string, chainId: number}>}
   */
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error(ERROR_MESSAGES.METAMASK_NOT_INSTALLED);
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = await this.signer.getAddress();

      // Get network info
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);

      // Verify correct network (Sepolia)
      if (this.chainId !== BLOCKCHAIN.CHAIN_ID) {
        console.warn(ERROR_MESSAGES.WRONG_NETWORK);
        // Optionally auto-switch network here
      }

      // Initialize contracts
      await this.initializeContracts();

      // Setup account change listener
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));

      return {
        account: this.account,
        chainId: this.chainId
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Initialize smart contracts
   */
  async initializeContracts() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    const productRegistryAddress = process.env.NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS;
    const paymentEscrowAddress = process.env.NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS;

    if (productRegistryAddress && ProductRegistryABI.length > 0) {
      this.productRegistry = new ethers.Contract(
        productRegistryAddress,
        ProductRegistryABI,
        this.signer
      );
    }

    if (paymentEscrowAddress && PaymentEscrowABI.length > 0) {
      this.paymentEscrow = new ethers.Contract(
        paymentEscrowAddress,
        PaymentEscrowABI,
        this.signer
      );
    }
  }

  /**
   * Handle account change
   */
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask');
      this.disconnect();
    } else if (accounts[0] !== this.account) {
      this.account = accounts[0];
      window.location.reload(); // Reload to reset state
    }
  }

  /**
   * Handle chain change
   */
  handleChainChanged() {
    window.location.reload();
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
    this.productRegistry = null;
    this.paymentEscrow = null;
  }

  /**
   * Register new product on blockchain
   * @param {string} name - Product name
   * @param {string} batchNumber - Batch number
   * @returns {Promise<{productId: number, txHash: string}>}
   */
  async registerProduct(name, batchNumber) {
    if (!this.productRegistry) {
      throw new Error('Product Registry contract not initialized');
    }

    try {
      const tx = await this.productRegistry.registerProduct(name, batchNumber);
      const receipt = await tx.wait(BLOCKCHAIN.BLOCK_CONFIRMATIONS);

      // Parse ProductRegistered event to get product ID
      const event = receipt.logs.find(
        (log) => {
          try {
            const parsed = this.productRegistry.interface.parseLog(log);
            return parsed?.name === 'ProductRegistered';
          } catch {
            return false;
          }
        }
      );

      if (event) {
        const parsed = this.productRegistry.interface.parseLog(event);
        const productId = Number(parsed.args[0]);
        return {
          productId,
          txHash: receipt.hash
        };
      }

      throw new Error('ProductRegistered event not found');
    } catch (error) {
      console.error('Error registering product:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error(ERROR_MESSAGES.TRANSACTION_REJECTED);
      }
      throw error;
    }
  }

  /**
   * Add checkpoint to product
   * @param {number} productId - Blockchain product ID
   * @param {string} location - Location description
   * @param {number} status - Status enum (0-5)
   * @param {string} notes - Additional notes
   * @param {number} temperature - Temperature in Celsius
   * @returns {Promise<{txHash: string}>}
   */
  async addCheckpoint(productId, location, status, notes, temperature) {
    if (!this.productRegistry) {
      throw new Error('Product Registry contract not initialized');
    }

    try {
      // Convert temperature to blockchain format (Celsius × 10)
      const tempInt = Math.round(temperature * 10);

      const tx = await this.productRegistry.addCheckpoint(
        productId,
        location,
        status,
        notes || '',
        tempInt
      );

      const receipt = await tx.wait(BLOCKCHAIN.BLOCK_CONFIRMATIONS);

      return {
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error adding checkpoint:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error(ERROR_MESSAGES.TRANSACTION_REJECTED);
      }
      throw error;
    }
  }

  /**
   * Get product details from blockchain
   * @param {number} productId - Blockchain product ID
   * @returns {Promise<Object>}
   */
  async getProduct(productId) {
    if (!this.productRegistry) {
      throw new Error('Product Registry contract not initialized');
    }

    try {
      const product = await this.productRegistry.getProduct(productId);

      return {
        id: Number(product.id),
        name: product.name,
        batchNumber: product.batchnumber,
        manufacturer: product.manufacturer,
        manufacturerDate: new Date(Number(product.manufacturerDate) * 1000),
        currentState: Number(product.currentState),
        currentHolder: product.currentHolder,
        exists: product.exists
      };
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  /**
   * Get checkpoints for a product from blockchain
   * @param {number} productId - Blockchain product ID
   * @returns {Promise<Array>}
   */
  async getCheckpoints(productId) {
    if (!this.productRegistry) {
      throw new Error('Product Registry contract not initialized');
    }

    try {
      const checkpoints = await this.productRegistry.getCheckpoints(productId);

      return checkpoints.map((cp) => ({
        handler: cp.handler,
        location: cp.location,
        timestamp: new Date(Number(cp.timestamp) * 1000),
        status: Number(cp.status),
        notes: cp.notes,
        temperature: Number(cp.temperature) / 10, // Convert back to Celsius
        temperatureInRange: cp.temperatureInRange
      }));
    } catch (error) {
      console.error('Error getting checkpoints:', error);
      throw error;
    }
  }

  /**
   * Listen to contract events
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  listenToEvents(eventName, callback) {
    if (this.productRegistry) {
      this.productRegistry.on(eventName, callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(eventName, callback) {
    if (this.productRegistry) {
      this.productRegistry.off(eventName, callback);
    }
  }

  /**
   * Get current wallet address
   * @returns {string|null}
   */
  getAccount() {
    return this.account;
  }

  /**
   * Check if wallet is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.account !== null;
  }

  /**
   * Switch to Sepolia network
   */
  async switchToSepolia() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error(ERROR_MESSAGES.METAMASK_NOT_INSTALLED);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }] // 11155111 in hex
      });
    } catch (error) {
      // Chain not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }
          ]
        });
      } else {
        throw error;
      }
    }
  }

  // Alias for backward compatibility
  async switchToMumbai() {
    return this.switchToSepolia();
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;
