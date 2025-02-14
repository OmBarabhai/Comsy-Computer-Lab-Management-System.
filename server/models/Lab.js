import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Lab', labSchema);