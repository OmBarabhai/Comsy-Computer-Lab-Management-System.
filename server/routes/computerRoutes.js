import express from 'express';
import mongoose from 'mongoose';
import Computer from '../models/Computer.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js'; // Use named imports
// Add to Computer model


const router = express.Router();

// Submit computer registration
// Remove authentication from registration endpoint
router.post('/register', async (req, res) => { // Removed 'authenticate' middleware
    try {
        const { name, specs, ipAddress } = req.body;

        // Validate required fields
        if (!name || !specs || !ipAddress) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new computer
        const newComputer = new Computer({
            name,
            specs,
            ipAddress,
            status: 'pending',
            registeredBy: null // Allow null for guest registrations
        });

        await newComputer.save();

        res.status(201).json({ message: 'Computer registered successfully', computer: newComputer });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});


// Get pending computers (Admin only)
// Add this route
router.get('/', authenticate, async (req, res) => {
    try {
        const computers = await Computer.find()
            .select('-__v')
            .populate('registeredBy', 'name email') // Optional: populate user details
            .lean();

        const formattedComputers = computers.map(computer => ({
            ...computer,
            id: computer._id.toString(),
            _id: undefined,
            registeredBy: computer.registeredBy?.name || 'System'
        }));

        res.json(formattedComputers);
    } catch (error) {
        console.error('Failed to fetch computers:', error);
        res.status(500).json({ message: 'Failed to fetch computers' });
    }
});

// routes/computerRoutes.js
router.get('/pending', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const pendingComputers = await Computer.find({ status: 'pending' })
            .select('_id name ipAddress specs status')
            .lean();

        res.json(pendingComputers);

    } catch (error) {
        console.error('Pending computers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending computers',
            error: error.message
        });
    }
});

router.get('/available', authenticate, async (req, res) => {
    try {
        const computers = await Computer.find({ operationalStatus: 'available' });
        res.json(computers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approval endpoint
router.patch('/:id/approve', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const computer = await Computer.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true, runValidators: true }
        );

        if (!computer) {
            return res.status(404).json({ 
                success: false,
                message: 'Computer not found'
            });
        }

        res.json({ 
            success: true,
            message: 'Computer approved successfully',
            computer
        });

    } catch (error) {
        console.error('Approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve computer',
            error: error.message
        });
    }
});

// Rejection endpoint
router.delete('/:id/reject', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const computer = await Computer.findByIdAndDelete(req.params.id);

        if (!computer) {
            return res.status(404).json({
                success: false,
                message: 'Computer not found'
            });
        }

        res.json({
            success: true,
            message: 'Computer rejected successfully'
        });

    } catch (error) {
        console.error('Rejection error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject computer',
            error: error.message
        });
    }
});

router.delete('/ip/:ipAddress', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const ipAddress = req.params.ipAddress;
        
        // Validate IP address format
        if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ipAddress)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid IP address format'
            });
        }

        const deletedComputer = await Computer.findOneAndDelete({ ipAddress });

        if (!deletedComputer) {
            return res.status(404).json({
                success: false,
                message: 'Computer with this IP address not found'
            });
        }

        res.json({
            success: true,
            message: 'Computer deleted successfully'
        });

    } catch (error) {
        console.error('Delete by IP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete computer',
            error: error.message
        });
    }
});

export default router;