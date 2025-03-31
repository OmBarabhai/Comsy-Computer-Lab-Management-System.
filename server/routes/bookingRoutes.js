import mongoose from 'mongoose';
import express from 'express';
import Booking from '../models/Booking.js';
import Computer from '../models/Computer.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { generateExcel, generatePDF } from '../utils/exportUtils.js';

const router = express.Router();

// Helper function to convert to IST (UTC+5:30)
function toIST(date) {
    return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
}

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
        if (!computerDetails || computerDetails.status !== 'approved') {
            return res.status(400).json({ message: 'Computer is not available for booking.' });
        }

        // Convert startTime and endTime to Date objects in UTC
        const start = new Date(startTime);
        const end = new Date(endTime);

        // Validate time range (end time must be after start time)
        if (end <= start) {
            return res.status(400).json({ message: 'End time must be after start time.' });
        }

        // Check for overlapping bookings (using UTC times)
        const overlappingBooking = await Booking.findOne({
            computer: computer,
            status: { $in: ['upcoming', 'ongoing'] },
            $or: [
                { startTime: { $lt: end }, endTime: { $gt: start } },
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({ message: 'Computer is already booked for this time.' });
        }

        // Create the booking (storing times in UTC)
        const booking = new Booking({
            user: req.user.userId,
            computer: computer,
            startTime: start,
            endTime: end,
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

// Middleware to update booking statuses (using UTC)
router.use(async (req, res, next) => {
    try {
        const now = new Date(); // UTC time

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
        
        await Computer.updateMany(
            { _id: { $in: computerIds } },
            { operationalStatus: 'in-use' }
        );

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

// Get all bookings (Admin only) - Convert to IST before sending
router.get('/', authenticate, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'username')
            .populate('computer', 'name specs');

        // Convert UTC times to IST for response
        const bookingsWithIST = bookings.map(booking => ({
            ...booking.toObject(),
            startTime: toIST(booking.startTime),
            endTime: toIST(booking.endTime),
            createdAt: toIST(booking.createdAt),
            updatedAt: toIST(booking.updatedAt)
        }));

        res.json(bookingsWithIST);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Download attendance - Convert to IST
router.get('/attendance', authenticate, async (req, res) => {
    try {
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ message: 'Please provide a valid date range.' });
        }

        // Convert input dates from IST to UTC for query
        const fromUTC = new Date(new Date(from).getTime() - (5.5 * 60 * 60 * 1000));
        const toUTC = new Date(new Date(to).getTime() - (5.5 * 60 * 60 * 1000));

        const bookings = await Booking.find({
            startTime: { $gte: fromUTC },
            endTime: { $lte: toUTC }
        })
        .populate('user', 'username')
        .populate('computer', 'name');

        // Convert to IST for response
        const bookingsWithIST = bookings.map(booking => ({
            ...booking.toObject(),
            startTime: toIST(booking.startTime),
            endTime: toIST(booking.endTime)
        }));

        res.json(bookingsWithIST);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: error.message });
    }
});

// Download attendance as Excel - Handle IST conversion in exportUtils
router.get('/attendance/excel', authenticate, async (req, res) => {
    try {
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ message: 'Please provide a valid date range.' });
        }

        // Convert input dates from IST to UTC for query
        const fromUTC = new Date(new Date(from).getTime() - (5.5 * 60 * 60 * 1000));
        const toUTC = new Date(new Date(to).getTime() - (5.5 * 60 * 60 * 1000));

        const bookings = await Booking.find({
            startTime: { $gte: fromUTC },
            endTime: { $lte: toUTC }
        })
        .populate('user', 'username')
        .populate('computer', 'name');

        // Generate Excel with IST times (handle conversion in exportUtils)
        const filePath = await generateExcel(bookings, true); // Pass true for IST conversion

        res.download(filePath);
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).json({ message: error.message });
    }
});

// Download attendance as PDF - Handle IST conversion in exportUtils
router.get('/attendance/pdf', authenticate, async (req, res) => {
    try {
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ message: 'Please provide a valid date range.' });
        }

        // Convert input dates from IST to UTC for query
        const fromUTC = new Date(new Date(from).getTime() - (5.5 * 60 * 60 * 1000));
        const toUTC = new Date(new Date(to).getTime() - (5.5 * 60 * 60 * 1000));

        const bookings = await Booking.find({
            startTime: { $gte: fromUTC },
            endTime: { $lte: toUTC }
        })
        .populate('user', 'username')
        .populate('computer', 'name');

        // Generate PDF with IST times (handle conversion in exportUtils)
        const filePath = await generatePDF(bookings, true); // Pass true for IST conversion

        res.download(filePath);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;