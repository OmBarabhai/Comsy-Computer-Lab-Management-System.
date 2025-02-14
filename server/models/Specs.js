import mongoose from 'mongoose';

const specsSchema = new mongoose.Schema({
  cpu: { type: String, required: true },
  ram: { type: String, required: true },
  storage: { type: String, required: true },
  network: { type: String, required: true }, // Internet connection status
  devices: [{ type: String }], // Input/output devices (keyboard, mouse, etc.)
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Specs', specsSchema);