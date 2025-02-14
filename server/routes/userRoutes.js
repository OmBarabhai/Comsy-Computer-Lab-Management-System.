import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js'; // Add this line
import User from '../models/User.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all users (Admin only)
router.get('/', authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;