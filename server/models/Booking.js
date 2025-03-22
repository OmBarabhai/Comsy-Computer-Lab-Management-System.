import mongoose from 'mongoose';
import Computer from './Computer.js'; // Import Computer model

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    computer: { type: mongoose.Schema.Types.ObjectId, ref: 'Computer', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' }
}, { timestamps: true });

// Pre-save hook to update status to "completed" if end time has passed
bookingSchema.pre('save', function (next) {
    const now = new Date();
    if (this.endTime < now) {
        this.status = 'completed';
    }
    next();
});

// Post-save hook to update computer status when booking is completed
bookingSchema.post('save', async function (doc) {
    if (doc.status === 'completed') {
        const computer = await Computer.findById(doc.computer);
        if (computer) {
            computer.operationalStatus = 'available';
            await computer.save();
        }
    }
});

export default mongoose.model('Booking', bookingSchema);