import Computer from '../models/Computer.js';
import Issue from '../models/Issue.js';

// Get all computers
export const getComputers = async (req, res) => {
  try {
    const computers = await Computer.find().populate('specs');
    res.status(200).json(computers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching computers', error });
  }
};

// Resolve issue and update computer status
export const resolveIssue = async (req, res) => {
  const { issueId, computerId } = req.body;

  try {
    // Mark issue as resolved
    await Issue.findByIdAndUpdate(issueId, { status: 'resolved' });

    // Update computer status to available
    await Computer.findByIdAndUpdate(computerId, { status: 'available' });

    res.status(200).json({ message: 'Issue resolved and computer status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error resolving issue', error });
  }
};