import express from 'express';
import {
  registerProduct,
  getAllProducts,
  getProductById,
  verifyProduct,
  updateProduct,
  updateBlockchainHash,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticateToken, authorizeRoles, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/verify/:productId', verifyProduct);

// Protected routes (authentication required)
router.post('/', authenticateToken, authorizeRoles('MANUFACTURER', 'ADMIN'), registerProduct);
router.get('/', authenticateToken, getAllProducts);
router.get('/:id', authenticateToken, getProductById);
router.put('/:id', authenticateToken, updateProduct);
router.put('/:id/blockchain', authenticateToken, updateBlockchainHash);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
