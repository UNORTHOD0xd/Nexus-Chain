/**
 * Application constants and enums
 */

// Status enum (matches blockchain contract)
export const STATUS = {
  MANUFACTURED: 0,
  IN_TRANSIT: 1,
  IN_WAREHOUSE: 2,
  CUSTOMS: 3,
  DELIVERED: 4,
  VERIFIED: 5
};

export const STATUS_LABELS = {
  [STATUS.MANUFACTURED]: 'Manufactured',
  [STATUS.IN_TRANSIT]: 'In Transit',
  [STATUS.IN_WAREHOUSE]: 'In Warehouse',
  [STATUS.CUSTOMS]: 'Customs',
  [STATUS.DELIVERED]: 'Delivered',
  [STATUS.VERIFIED]: 'Verified'
};

export const STATUS_COLORS = {
  [STATUS.MANUFACTURED]: 'bg-blue-100 text-blue-800',
  [STATUS.IN_TRANSIT]: 'bg-yellow-100 text-yellow-800',
  [STATUS.IN_WAREHOUSE]: 'bg-purple-100 text-purple-800',
  [STATUS.CUSTOMS]: 'bg-orange-100 text-orange-800',
  [STATUS.DELIVERED]: 'bg-green-100 text-green-800',
  [STATUS.VERIFIED]: 'bg-teal-100 text-teal-800'
};

// Role enum (matches backend)
export const ROLE = {
  NONE: 0,
  MANUFACTURER: 1,
  LOGISTICS: 2,
  RETAILER: 3,
  CONSUMER: 4
};

export const ROLE_LABELS = {
  [ROLE.NONE]: 'None',
  [ROLE.MANUFACTURER]: 'Manufacturer',
  [ROLE.LOGISTICS]: 'Logistics Provider',
  [ROLE.RETAILER]: 'Retailer',
  [ROLE.CONSUMER]: 'Consumer'
};

// Temperature thresholds (Celsius)
export const TEMPERATURE = {
  MIN: 2.0,
  MAX: 8.0,
  OPTIMAL_MIN: 3.0,
  OPTIMAL_MAX: 7.0
};

// QR code configuration
export const QR_CONFIG = {
  PREFIX: 'NEXUS',
  WIDTH: 300,
  MARGIN: 2,
  ERROR_CORRECTION_LEVEL: 'M'
};

// API configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// WebSocket events
export const WS_EVENTS = {
  PRODUCT_REGISTERED: 'product_registered',
  CHECKPOINT_ADDED: 'checkpoint_added',
  CHECKPOINT_UPDATE: 'checkpoint_update',
  STATUS_UPDATED: 'status_updated',
  TEMPERATURE_ALERT: 'temperature_alert',
  SUBSCRIBE_PRODUCT: 'subscribe_product'
};

// Blockchain configuration
export const BLOCKCHAIN = {
  SEPOLIA_CHAIN_ID: 11155111,
  BLOCK_CONFIRMATIONS: 2,
  GAS_LIMIT_MULTIPLIER: 1.2,
  // Legacy support
  POLYGON_MUMBAI_CHAIN_ID: 80001
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'nexus_auth_token',
  USER_DATA: 'nexus_user_data',
  WALLET_ADDRESS: 'nexus_wallet_address',
  THEME: 'nexus_theme'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  METAMASK_NOT_INSTALLED: 'MetaMask is not installed. Please install it to continue.',
  WRONG_NETWORK: 'Please switch to Sepolia testnet.',
  TRANSACTION_REJECTED: 'Transaction was rejected.',
  INVALID_QR_CODE: 'Invalid QR code format. Expected format: NEXUS-{id}'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Account created successfully!',
  PRODUCT_REGISTERED: 'Product registered successfully!',
  CHECKPOINT_ADDED: 'Checkpoint added successfully!',
  WALLET_CONNECTED: 'Wallet connected successfully!'
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, and number',
  INVALID_BATCH_NUMBER: 'Batch number must be 3-50 alphanumeric characters',
  TEMPERATURE_OUT_OF_RANGE: 'Temperature must be between 2°C and 8°C'
};

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [20.5937, 78.9629], // India center
  DEFAULT_ZOOM: 5,
  MARKER_ZOOM: 13,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_LAYER_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};
