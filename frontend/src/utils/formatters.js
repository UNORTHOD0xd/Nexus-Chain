/**
 * Utility functions for formatting data for display
 */

/**
 * Format date to localized string
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export const formatDate = (date, includeTime = true) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (includeTime) {
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format temperature with unit
 * @param {number} temperature - Temperature in Celsius
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted temperature (e.g., "4.5°C")
 */
export const formatTemperature = (temperature, decimals = 1) => {
  if (temperature === null || temperature === undefined) return 'N/A';
  return `${temperature.toFixed(decimals)}°C`;
};

/**
 * Format temperature from blockchain (stored as Celsius × 10)
 * @param {number} blockchainTemp - Temperature from blockchain
 * @returns {string} Formatted temperature
 */
export const formatBlockchainTemperature = (blockchainTemp) => {
  const celsius = blockchainTemp / 10;
  return formatTemperature(celsius);
};

/**
 * Convert temperature to blockchain format (Celsius × 10)
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Blockchain-formatted temperature
 */
export const toBlockchainTemperature = (celsius) => {
  return Math.round(celsius * 10);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateObj, false);
};

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1,234")
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
};

/**
 * Format blockchain status enum to display text
 * @param {number|string} status - Status enum value
 * @returns {string} Display text
 */
export const formatStatus = (status) => {
  const statusMap = {
    0: 'Manufactured',
    1: 'In Transit',
    2: 'In Warehouse',
    3: 'Customs',
    4: 'Delivered',
    5: 'Verified'
  };

  return statusMap[status] || 'Unknown';
};

/**
 * Format role enum to display text
 * @param {number|string} role - Role enum value
 * @returns {string} Display text
 */
export const formatRole = (role) => {
  const roleMap = {
    0: 'None',
    1: 'Manufacturer',
    2: 'Logistics Provider',
    3: 'Retailer',
    4: 'Consumer'
  };

  return roleMap[role] || 'Unknown';
};
