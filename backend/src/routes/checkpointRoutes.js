import express from 'express';
import {
  addCheckpoint,
  getCheckpointsByProductId,
  getCheckpointById,
  updateCheckpoint,
  deleteCheckpoint,
  getTemperatureAlerts,
} from '../controllers/checkpointController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All checkpoint routes require authentication
router.post(
  '/',
  authenticateToken,
  authorizeRoles('LOGISTICS', 'MANUFACTURER', 'ADMIN'),
  addCheckpoint
);

router.get('/product/:productId', authenticateToken, getCheckpointsByProductId);
router.get('/product/:productId/alerts', authenticateToken, getTemperatureAlerts);
router.get('/:id', authenticateToken, getCheckpointById);
router.put('/:id', authenticateToken, updateCheckpoint);
router.delete('/:id', authenticateToken, deleteCheckpoint);

export default router;
