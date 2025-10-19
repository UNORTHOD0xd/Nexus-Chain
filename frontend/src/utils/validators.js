/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
export const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate temperature range (cold chain compliance)
 * @param {number} temperature - Temperature in Celsius
 * @param {number} min - Minimum temperature (default: 2°C)
 * @param {number} max - Maximum temperature (default: 8°C)
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateTemperature = (temperature, min = 2.0, max = 8.0) => {
  if (temperature === null || temperature === undefined || isNaN(temperature)) {
    return {
      isValid: false,
      message: 'Temperature is required'
    };
  }

  if (temperature < min) {
    return {
      isValid: false,
      message: `Temperature too low (minimum: ${min}°C)`
    };
  }

  if (temperature > max) {
    return {
      isValid: false,
      message: `Temperature too high (maximum: ${max}°C)`
    };
  }

  return {
    isValid: true,
    message: 'Temperature within acceptable range'
  };
};

/**
 * Validate QR code format (NEXUS-{id})
 * @param {string} qrCode - QR code to validate
 * @returns {Object} { isValid: boolean, blockchainId: number|null }
 */
export const validateQRCode = (qrCode) => {
  const match = qrCode?.match(/^NEXUS-(\d+)$/);

  if (!match) {
    return {
      isValid: false,
      blockchainId: null
    };
  }

  return {
    isValid: true,
    blockchainId: parseInt(match[1])
  };
};

/**
 * Validate batch number format
 * @param {string} batchNumber - Batch number to validate
 * @returns {boolean} True if valid
 */
export const isValidBatchNumber = (batchNumber) => {
  // Alphanumeric with hyphens, 3-50 characters
  return /^[A-Za-z0-9-]{3,50}$/.test(batchNumber);
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if not empty
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};
