import mongoose from 'mongoose';

const ComputerSchema = new mongoose.Schema({
    name: String,
    specs: {
        cpu: String,
        ram: String,
        storage: String,
        os: String,
        network: String,
    },
    ipAddress: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    lab: String,
});

const Computer = mongoose.model('Computer', ComputerSchema);
export default Computer;