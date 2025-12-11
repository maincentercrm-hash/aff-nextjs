import mongoose from 'mongoose';

const uri: string = process.env.MONGODB_URI || '';

export async function connectDB(): Promise<void> {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    //console.log("Connected to MongoDB Atlas using Mongoose!");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas with Mongoose:", error);
    throw error;
  }
}

export default connectDB;
