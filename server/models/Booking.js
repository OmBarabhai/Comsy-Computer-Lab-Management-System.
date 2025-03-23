import mongoose from 'mongoose';
import Computer from './Computer.js'; // Import Computer model

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    computer: { type: mongoose.Schema.Types.ObjectId, ref: 'Computer', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
        default: 'upcoming' 
    },
    purpose: { type: String, required: true } // Add purpose fiel
}, { timestamps: true });


// Update pre-save hook in Booking.js
bookingSchema.pre('save', function (next) {
    const now = new Date();
    if (this.endTime < now) {
        this.status = 'completed';
    } else if (this.startTime <= now && this.endTime >= now) {
        this.status = 'ongoing';
    }
    next();
});

export default mongoose.model('Booking', bookingSchema);