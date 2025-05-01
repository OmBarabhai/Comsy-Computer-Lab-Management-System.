import express from 'express';
import mongoose from 'mongoose';
import Computer from '../models/Computer.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js'; // Use named imports
// Add to Computer model


const router = express.Router();

// Submit computer registration
router.post('/register', async (req, res) => {
    try {
        const { 
            name, 
            ipAddress, 
            macAddress,
            specs, 
            networkSpeed,
            powerStatus 
        } = req.body;

        // Validate required fields
        if (!name || !ipAddress || !macAddress || !specs) {
            return res.status(400).json({ 
                message: 'Name, IP address, MAC address, and specs are required' 
            });
        }

        // Validate specs structure
        if (!specs.cpu || !specs.ram || !specs.storage || !specs.os || !specs.network) {
            return res.status(400).json({ 
                message: 'All spec fields (CPU, RAM, Storage, OS, Network) are required' 
            });
        }

        // Ensure networkSpeed is an object with proper structure
        const validatedNetworkSpeed = networkSpeed && typeof networkSpeed === 'object' 
            ? {
                download: Number(networkSpeed.download) || 0,
                upload: Number(networkSpeed.upload) || 0,
                ping: Number(networkSpeed.ping) || 0
            }
            : {
                download: 0,
                upload: 0,
                ping: 0
            };

        // Create a new computer with all fields
        const newComputer = new Computer({
            name,
            ipAddress,
            macAddress,
            specs: {
                cpu: specs.cpu,
                ram: specs.ram,
                storage: specs.storage,
                os: specs.os,
                network: specs.network,
                hardwareConnected: specs.hardwareConnected || {
                    keyboard: false,
                    mouse: false,
                    monitor: false,
                    headphone: false,
                    microphone: false,
                    pendrive: false
                }
            },
            networkSpeed: validatedNetworkSpeed,
            powerStatus: powerStatus || 'on',
            status: 'pending',
            operationalStatus: 'available',
            registeredBy: null
        });

        await newComputer.save();

        res.status(201).json({ 
            message: 'Computer registered successfully', 
            computer: {
                id: newComputer._id,
                name: newComputer.name,
                ipAddress: newComputer.ipAddress,
                macAddress: newComputer.macAddress,
                status: newComputer.status
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate MAC address error specifically
        if (error.code === 11000 && error.keyPattern?.macAddress) {
            return res.status(409).json({ 
                message: 'A computer with this MAC address is already registered' 
            });
        }

        res.status(500).json({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }
});

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
// Add these routes to your existing computerRoutes.js

// Background update endpoint
router.patch('/update-specs', async (req, res) => {
    try {
        const { macAddress, ipAddress, specs, powerStatus, networkSpeed } = req.body;

        const updateData = {
            ipAddress,
            specs,
            powerStatus,
            networkSpeed,
            lastUpdated: new Date()
        };

        const computer = await Computer.findOneAndUpdate(
            { macAddress },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Specs updated successfully',
            computer
        });

    } catch (error) {
        console.error('Background update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update specs',
            error: error.message
        });
    }
});

// Heartbeat endpoint
router.patch('/heartbeat', async (req, res) => {
    try {
        const { macAddress, ipAddress } = req.body;

        await Computer.findOneAndUpdate(
            { macAddress },
            { 
                ipAddress,
                lastUpdated: new Date(),
                operationalStatus: 'available'
            },
            { upsert: true }
        );

        res.json({ success: true, message: 'Heartbeat received' });

    } catch (error) {
        console.error('Heartbeat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process heartbeat',
            error: error.message
        });
    }
});

export default router;