import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  computer: { type: mongoose.Schema.Types.ObjectId, ref: 'Computer', required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'reported' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Issue', issueSchema);