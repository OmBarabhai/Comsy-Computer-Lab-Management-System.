import express from 'express';
import { validateBookingCreation, handleValidationErrors } from '../middleware/validation.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Create new booking with validation
router.post('/', validateBookingCreation, handleValidationErrors, async (req, res) => {
  try {
    const booking = new Booking({
      user: req.user._id,
      computer: req.body.computer_id,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;