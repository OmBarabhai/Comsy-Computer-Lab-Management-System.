import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const atlasUri = 'mongodb+srv://techspace:9011232879@cluster0.31ygm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
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
