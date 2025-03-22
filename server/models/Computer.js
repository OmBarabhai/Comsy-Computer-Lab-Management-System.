import mongoose from 'mongoose';

const computerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ipAddress: { type: String, required: true },
    specs: {
        cpu: { type: String, required: true },
        ram: { type: String, required: true },
        storage: { type: String, required: true },
        os: { type: String, required: true },
        network: { type: String, required: true }
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    operationalStatus: {
        type: String,
        enum: ['available', 'in-use', 'maintenance'],
        default: 'available'
    },
    powerStatus: {
        type: String,
        enum: ['on', 'off'],
        default: 'on'
    },
    networkSpeed: {
        type: Number,
        default: 0
    },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    registeredAt: { type: Date, default: Date.now }
});

export default mongoose.model('Computer', computerSchema);