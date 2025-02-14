require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Computer Model
const computerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specs: {
        cpu: String,
        ram: String,
        storage: String,
        os: String,
        network: String
    },
    ipAddress: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Computer = mongoose.model('Computer', computerSchema);

// Registration Endpoint
app.post('/api/computers/register', async (req, res) => {
    try {
        // Validate request body
        const { name, specs, ipAddress } = req.body;
        
        if (!name || !specs || !ipAddress) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, specs, or ipAddress'
            });
        }

        // Create new computer record
        const newComputer = new Computer({
            name,
            specs,
            ipAddress
        });

        // Save to database
        const savedComputer = await newComputer.save();

        res.status(201).json({
            success: true,
            message: 'Computer registration submitted for admin approval',
            computer: savedComputer
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));