import mongoose from 'mongoose';

const computerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ipAddress: { type: String, required: true, unique: true  },
    macAddress: { type: String, required: true, index: true },
    specs: {
        cpu: { type: String, required: true },
        ram: { type: String, required: true },
        storage: { type: String, required: true },
        os: { type: String, required: true },
        network: { type: String, required: true },
        hardwareConnected: {
            keyboard: { type: Boolean, default: false },
            mouse: { type: Boolean, default: false },
            monitor: { type: Boolean, default: false },
            headphone: { type: Boolean, default: false },
            microphone: { type: Boolean, default: false },
            pendrive: { type: Boolean, default: false }
        }
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
        download: { type: Number, default: 0 },
        upload: { type: Number, default: 0 },
        ping: { type: Number, default: 0 }
    },
    lastUpdated: { type: Date, default: Date.now },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Computer', computerSchema);