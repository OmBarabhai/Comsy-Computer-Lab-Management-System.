import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    status: { type: String, enum: ['present', 'absent'], default: 'present' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Attendance', attendanceSchema);