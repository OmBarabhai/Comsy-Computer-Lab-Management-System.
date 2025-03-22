import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  computer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Computer', 
      required: true 
  },
  reportedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
  },
  description: { type: String, required: true },
  status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open'
  }
}, { timestamps: true });

export default mongoose.model('Issue', issueSchema);