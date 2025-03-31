import express from 'express';
import Issue from '../models/Issue.js';
import mongoose from 'mongoose';
import Computer from '../models/Computer.js'; // Import the Computer model
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to report a new issue
// issueRoutes.js (POST route
router.post('/', authenticate, async (req, res) => {
    try {
      const { computer, description } = req.body;
  
      // Validate computer ID
      if (!mongoose.Types.ObjectId.isValid(computer)) {
        return res.status(400).json({ error: 'Invalid computer ID' });
      }
  
      const issue = new Issue({
        computer,
        description,
        reportedBy: req.user.userId
      });
  
      await issue.save();
  
      // Update computer status - this is correct
      await Computer.findByIdAndUpdate(
        computer,
        { operationalStatus: 'maintenance' }
      );
  
      res.status(201).json(issue);
    } catch (error) {
      console.error('Error reporting issue:', error);
      res.status(400).json({ error: error.message });
    }
});

// Route to get all issues (Admin only)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const issues = await Issue.find()
            .populate('computer', 'name') // Populate computer details
            .populate('reportedBy', 'username'); // Populate user details with username
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to update issue status (Admin only)


// Route to resolve an issue (Admin only)
router.patch('/:id/resolve', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) throw new Error('Issue not found');

        // Update the computer's operational status to "available"
        await Computer.findByIdAndUpdate(
            issue.computer,
            { operationalStatus: 'available' }
        );

        // Mark the issue as resolved
        issue.status = 'resolved';
        await issue.save();

        res.status(200).json({ message: 'Issue resolved successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;