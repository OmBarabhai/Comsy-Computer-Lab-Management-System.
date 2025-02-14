import express from 'express';
import { authenticate, checkPermission } from '../middleware/authMiddleware.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();
router.use(authenticate);

// Save attendance (Staff)
router.post('/', checkPermission('save_attendance'), async (req, res) => {
  try {
    const { userId, status } = req.body;
    const attendance = new Attendance({
      user: userId,
      status,
      markedBy: req.user._id, // Logged-in staff member
    });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendance records (Staff/Admin)
router.get('/', checkPermission('save_attendance'), async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find();
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;