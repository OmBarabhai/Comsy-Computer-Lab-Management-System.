import express from 'express';
import Booking from '../models/Booking.js';
import Computer from '../models/Computer.js'; // Import Computer model
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new booking
router.post('/', authenticate, async (req, res) => {
  try {
      const { computerId, startTime, endTime } = req.body;

      // Validate booking time
      if (new Date(startTime) >= new Date(endTime)) {
          return res.status(400).json({ message: 'End time must be after start time.' });
      }

      // Check if the computer exists and is available
      const computer = await Computer.findById(computerId);
      if (!computer || computer.operationalStatus !== 'available') {
          return res.status(400).json({ message: 'Computer is not available for booking.' });
      }

      // Check for overlapping bookings
      const overlappingBooking = await Booking.findOne({
          computer: computerId,
          $or: [
              { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } },
          ]
      });

      if (overlappingBooking) {
          return res.status(400).json({ message: 'Computer is already booked for this time.' });
      }

      // Create the booking
      const booking = new Booking({
          user: req.user.userId,
          computer: computerId,
          startTime,
          endTime,
          status: 'upcoming'
      });

      await booking.save();

      // Update the computer's operational status to "booked"
      computer.operationalStatus = 'booked';
      await computer.save();

      res.status(201).json(booking);
  } catch (error) {
      console.error('Error creating booking:', error);
      res.status(400).json({ message: error.message });
  }
});

// Get all bookings (Admin only)
router.get('/', authenticate, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'username') // Populate user details
            .populate('computer', 'name specs'); // Populate computer details
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Download attendance
router.get('/attendance', authenticate, async (req, res) => {
    try {
        const { from, to } = req.query;

        const bookings = await Booking.find({
            startTime: { $gte: new Date(from) },
            endTime: { $lte: new Date(to) }
        }).populate('user', 'username').populate('computer', 'name');

        res.json(bookings); // For now, return JSON
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;