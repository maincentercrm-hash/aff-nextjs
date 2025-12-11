import { NextResponse, type NextRequest } from 'next/server';

import { ObjectId } from 'mongodb';

import { connectDB } from '@/configs/mongodb';

export async function GET(req: NextRequest, { params }: { params: { table: string, id: string } }) {
  try {
    const { table, id } = params;

    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(table);

    // Connect to MongoDB
    await client.connect();

    // Determine search criteria based on table
    let searchCriteria;

    if (table === 'tbl_client_point') {
      searchCriteria = { tel: id };
    } else {
      searchCriteria = { _id: new ObjectId(id) };
    }

    // Find the document
    const data = await collection.findOne(searchCriteria);

    // Close the MongoDB connection
    await client.close();

    if (data) {
      // If data is found, return the data
      return NextResponse.json(data);
    } else {
      // If no data is found, return a response indicating no data was found
      return NextResponse.json({ status: false, message: "Data Not Found !!!" });
    }
  } catch (error) {
    console.error('Error Read Data:', error);

    // Return a generic internal server error message
    return NextResponse.json({ message: 'Internal server error' });
  }
}

export const dynamic = "force-dynamic";
