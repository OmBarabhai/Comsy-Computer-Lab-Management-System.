import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js'; // Add this line
import Issue from '../models/Issue.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all issues (Admin only)
router.get('/', authorize(['admin']), async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new issue (Authenticated users only)
router.post('/', async (req, res) => {
  const issue = new Issue({
    user: req.user._id, // Use the authenticated user's ID
    computer: req.body.computer_id,
    description: req.body.description,
  });

  try {
    const newIssue = await issue.save();
    res.status(201).json(newIssue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;