import { MongoClient, ServerApiVersion } from 'mongodb';

const uri: string = `${process.env.MONGODB_URI}`;

export async function connectDB(): Promise<MongoClient> {
  const client: MongoClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");

    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    throw error;
  }
}

export default connectDB;
