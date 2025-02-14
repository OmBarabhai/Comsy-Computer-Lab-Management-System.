import express from 'express';
import { getComputers, resolveIssue } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all computers (Admin only)
router.get('/computers', authenticate, authorize(['admin']), getComputers);

// Resolve issue (Admin only)
router.post('/resolve-issue', authenticate, authorize(['admin']), resolveIssue);

export default router;