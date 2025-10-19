import express from 'express';
import {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateMe);
router.put('/change-password', authenticateToken, changePassword);

export default router;
