// routes/computerRoutes.js
import express from 'express';
import Computer from '../models/Computer.js';

const router = express.Router();

// Submit computer registration
router.post('/register', async (req, res) => {
    try {
        const computer = new Computer(req.body);
        await computer.save();
        res.status(201).json({ message: 'Registration request sent to admin!' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering computer' });
    }
});

// Fetch pending computers (admin)
router.get('/pending', async (req, res) => {
    try {
        const computers = await Computer.find({ status: 'pending' });
        res.json(computers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
});

export default router;