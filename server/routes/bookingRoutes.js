import express from 'express';
import Booking from '../models/Booking.js';
import Computer from '../models/Computer.js'; // Import Computer model
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new booking
router.post('/', authenticate, async (req, res) => {
    try {
        const { computer, startTime, endTime, purpose } = req.body;

        // Validate required fields
        if (!computer || !startTime || !endTime || !purpose) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate computerId
        if (!mongoose.Types.ObjectId.isValid(computer)) {
            return res.status(400).json({ message: 'Invalid computer ID.' });
        }

        // Check if the computer exists and is available
        const computerDetails = await Computer.findById(computer);
        console.log('Computer Details:', computerDetails); // Debugging log

        if (!computerDetails || computerDetails.status !== 'approved' || computerDetails.operationalStatus !== 'available') {
            return res.status(400).json({ message: 'Computer is not available for booking.' });
        }

        // Convert startTime and endTime to Date objects
        const start = new Date(startTime);
        const end = new Date(endTime);
        console.log('Parsed Start Time:', start);
        console.log('Parsed End Time:', end);

        // Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
            computer: computer,
            status: { $in: ['upcoming', 'ongoing'] },
            $or: [
                { startTime: { $lt: end }, endTime: { $gt: start } },
            ]
        });

        console.log('Overlapping Booking:', overlappingBooking); // Debugging log

        if (overlappingBooking) {
            return res.status(400).json({ message: 'Computer is already booked for this time.' });
        }

        // Create the booking
        const booking = new Booking({
            user: req.user.userId,
            computer: computer,
            startTime: startTime, // Use plain date string
            endTime: endTime, // Use plain date string
            purpose,
            status: 'upcoming'
        });

        await booking.save();
        res.status(201).json(booking);

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add middleware to update booking statuses
router.use(async (req, res, next) => {
    try {
        const now = new Date();
        // Update ongoing bookings
        await Booking.updateMany(
            {
                startTime: { $lte: now },
                endTime: { $gte: now },
                status: 'upcoming'
            },
            { status: 'ongoing' }
        );

        // Update completed bookings
        await Booking.updateMany(
            {
                endTime: { $lt: now },
                status: { $in: ['upcoming', 'ongoing'] }
            },
            { status: 'completed' }
        );

        // Update computer statuses based on bookings
        const ongoingBookings = await Booking.find({ status: 'ongoing' });
        const computerIds = ongoingBookings.map(b => b.computer);
        
        // Set computers in ongoing bookings to 'in-use'
        await Computer.updateMany(
            { _id: { $in: computerIds } },
            { operationalStatus: 'in-use' }
        );

        // Set computers not in ongoing bookings to 'available'
        await Computer.updateMany(
            { _id: { $nin: computerIds } },
            { operationalStatus: 'available' }
        );

        next();
    } catch (error) {
        console.error('Error updating booking statuses:', error);
        next(error);
    }
});

// Add cancel booking endpoint
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Only allow cancellation of upcoming bookings
        if (booking.status !== 'upcoming') {
            return res.status(400).json({ message: 'Only upcoming bookings can be cancelled' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
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