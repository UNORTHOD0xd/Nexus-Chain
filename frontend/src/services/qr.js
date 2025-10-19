/**
 * QR Code Service
 * QR code generation and parsing utilities
 */

import QRCode from 'qrcode';
import { QR_CONFIG, ERROR_MESSAGES } from '@/utils/constants';
import { validateQRCode } from '@/utils/validators';

/**
 * Generate QR code image from blockchain ID
 * @param {number} blockchainId - Product blockchain ID
 * @param {Object} options - QR code options
 * @returns {Promise<string>} Base64 data URL
 */
export const generateQRCode = async (blockchainId, options = {}) => {
  const qrData = `${QR_CONFIG.PREFIX}-${blockchainId}`;

  const defaultOptions = {
    width: options.width || QR_CONFIG.WIDTH,
    margin: options.margin || QR_CONFIG.MARGIN,
    errorCorrectionLevel: options.errorCorrectionLevel || QR_CONFIG.ERROR_CORRECTION_LEVEL,
    color: {
      dark: options.darkColor || '#000000',
      light: options.lightColor || '#FFFFFF'
    }
  };

  try {
    const dataUrl = await QRCode.toDataURL(qrData, defaultOptions);
    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code as SVG string
 * @param {number} blockchainId - Product blockchain ID
 * @param {Object} options - QR code options
 * @returns {Promise<string>} SVG string
 */
export const generateQRCodeSVG = async (blockchainId, options = {}) => {
  const qrData = `${QR_CONFIG.PREFIX}-${blockchainId}`;

  const defaultOptions = {
    width: options.width || QR_CONFIG.WIDTH,
    margin: options.margin || QR_CONFIG.MARGIN,
    errorCorrectionLevel: options.errorCorrectionLevel || QR_CONFIG.ERROR_CORRECTION_LEVEL,
    color: {
      dark: options.darkColor || '#000000',
      light: options.lightColor || '#FFFFFF'
    }
  };

  try {
    const svg = await QRCode.toString(qrData, {
      ...defaultOptions,
      type: 'svg'
    });
    return svg;
  } catch (error) {
    console.error('QR code SVG generation failed:', error);
    throw new Error('Failed to generate QR code SVG');
  }
};

/**
 * Parse QR code string and extract blockchain ID
 * @param {string} qrCode - QR code string (format: NEXUS-{id})
 * @returns {number} Blockchain ID
 * @throws {Error} If QR code format is invalid
 */
export const parseQRCode = (qrCode) => {
  const validation = validateQRCode(qrCode);

  if (!validation.isValid) {
    throw new Error(ERROR_MESSAGES.INVALID_QR_CODE);
  }

  return validation.blockchainId;
};

/**
 * Download QR code as PNG file
 * @param {string} dataUrl - QR code data URL
 * @param {string} filename - Download filename
 */
export const downloadQRCode = (dataUrl, filename = 'qrcode.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

/**
 * Create QR code filename from blockchain ID
 * @param {number} blockchainId - Product blockchain ID
 * @returns {string} Filename
 */
export const createQRFilename = (blockchainId) => {
  return `NEXUS-${blockchainId}.png`;
};

/**
 * Print QR code
 * @param {string} dataUrl - QR code data URL
 */
export const printQRCode = (dataUrl) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print QR Code</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="QR Code" />
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
