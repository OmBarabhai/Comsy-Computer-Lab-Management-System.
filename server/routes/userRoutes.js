import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js'; // Use named imports
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all users (Admin only)
router.get('/', authorize(['admin']), async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch profile data' });
    }
});

// Update user profile
// Update profile endpoint
router.put('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, currentPassword, newPassword } = req.body;

        // Update name and email
        if (name) user.name = name;
        if (email) user.email = email;

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required' });
            }
            
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
            
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        
        // Return user data without password
        const userData = user.toObject();
        delete userData.password;
        
        res.json({ message: 'Profile updated successfully', user: userData });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

export default router;