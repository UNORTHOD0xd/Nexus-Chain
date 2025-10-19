import { emitToProduct, emitToUser, emitToRole, broadcastEvent } from '../config/websocket.js';

/**
 * Emit product created event
 * @param {Object} product - Product data
 */
export const emitProductCreated = (product) => {
  // Notify manufacturer
  emitToUser(product.manufacturerId, 'product:created', {
    product,
    message: 'Product registered successfully',
  });

  // Notify all admins
  emitToRole('ADMIN', 'product:created', {
    product,
    message: `New product registered: ${product.name}`,
  });
};

/**
 * Emit product updated event
 * @param {Object} product - Updated product data
 */
export const emitProductUpdated = (product) => {
  // Notify product watchers
  emitToProduct(product.id, 'product:updated', {
    product,
    message: 'Product updated',
  });

  // Notify manufacturer
  emitToUser(product.manufacturerId, 'product:updated', {
    product,
    message: 'Your product was updated',
  });
};

/**
 * Emit checkpoint added event
 * @param {Object} checkpoint - Checkpoint data
 * @param {Object} product - Product data
 */
export const emitCheckpointAdded = (checkpoint, product) => {
  // Notify product watchers
  emitToProduct(checkpoint.productId, 'checkpoint:added', {
    checkpoint,
    product,
    message: `New checkpoint: ${checkpoint.location}`,
  });

  // Notify manufacturer
  emitToUser(product.manufacturerId, 'checkpoint:added', {
    checkpoint,
    product,
    message: `New checkpoint added for ${product.name}`,
  });
};

/**
 * Emit status changed event
 * @param {string} productId - Product ID
 * @param {string} oldStatus - Old status
 * @param {string} newStatus - New status
 * @param {Object} product - Product data
 */
export const emitStatusChanged = (productId, oldStatus, newStatus, product) => {
  // Notify product watchers
  emitToProduct(productId, 'product:status:changed', {
    productId,
    oldStatus,
    newStatus,
    message: `Status changed from ${oldStatus} to ${newStatus}`,
  });

  // Notify manufacturer
  emitToUser(product.manufacturerId, 'product:status:changed', {
    productId,
    oldStatus,
    newStatus,
    product,
    message: `${product.name} status changed to ${newStatus}`,
  });

  // Notify logistics if delivered
  if (newStatus === 'DELIVERED') {
    emitToRole('LOGISTICS', 'product:delivered', {
      product,
      message: `Product delivered: ${product.name}`,
    });
  }
};

/**
 * Emit temperature alert
 * @param {Object} checkpoint - Checkpoint data
 * @param {Object} product - Product data
 * @param {string} alertType - Alert type (TOO_HOT, TOO_COLD)
 */
export const emitTemperatureAlert = (checkpoint, product, alertType) => {
  const alertData = {
    checkpoint,
    product,
    alertType,
    temperature: checkpoint.temperature,
    threshold: alertType === 'TOO_HOT' ? product.maxTemperature : product.minTemperature,
    message: `Temperature alert for ${product.name}: ${checkpoint.temperature}°C`,
  };

  // Notify product watchers
  emitToProduct(product.id, 'temperature:alert', alertData);

  // Notify manufacturer
  emitToUser(product.manufacturerId, 'temperature:alert', alertData);

  // Notify all logistics and admins
  emitToRole('LOGISTICS', 'temperature:alert', alertData);
  emitToRole('ADMIN', 'temperature:alert', alertData);
};

/**
 * Emit location update
 * @param {string} productId - Product ID
 * @param {string} oldLocation - Old location
 * @param {string} newLocation - New location
 * @param {Object} checkpoint - Checkpoint data
 */
export const emitLocationUpdate = (productId, oldLocation, newLocation, checkpoint) => {
  emitToProduct(productId, 'product:location:updated', {
    productId,
    oldLocation,
    newLocation,
    checkpoint,
    message: `Location updated to ${newLocation}`,
  });
};

/**
 * Emit real-time checkpoint update
 * @param {Object} checkpoint - Checkpoint data with updates
 */
export const emitCheckpointUpdated = (checkpoint) => {
  emitToProduct(checkpoint.productId, 'checkpoint:updated', {
    checkpoint,
    message: 'Checkpoint updated',
  });
};

/**
 * Emit blockchain confirmation
 * @param {Object} product - Product data
 * @param {string} transactionHash - Blockchain transaction hash
 */
export const emitBlockchainConfirmation = (product, transactionHash) => {
  emitToProduct(product.id, 'blockchain:confirmed', {
    product,
    transactionHash,
    message: 'Blockchain transaction confirmed',
  });

  emitToUser(product.manufacturerId, 'blockchain:confirmed', {
    product,
    transactionHash,
    message: `${product.name} blockchain registration confirmed`,
  });
};
