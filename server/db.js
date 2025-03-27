import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const atlasUri = process.env.atlasUri;
const connectDB = async () => {
  try {
      await mongoose.connect(atlasUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
      console.log('MongoDB Atlas connected');
  } catch (err) {
      console.error('MongoDB Atlas connection error:', err);
  }
};

export default connectDB;
