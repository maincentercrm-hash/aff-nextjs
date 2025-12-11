import { NextResponse } from 'next/server';

import { ObjectId } from 'mongodb'; // Import ObjectId from mongodb

import { connectDB } from '@/configs/mongodb';

export async function POST(req: Request) {
  try {
    const { table, data } = await req.json();

    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(table);
    const currentDate = new Date().toISOString();

    await client.connect();

    // Check if mission_id exists and convert it to ObjectId
    if (data.mission_id) {
      data.mission_id = new ObjectId(data.mission_id);
    }

    data.createDate = currentDate;

    const result = await collection.insertOne(data);

    await client.close();

    // Return the ID of the newly created document
    return NextResponse.json({ message: 'Create Success !!!', id: result.insertedId, items: data });
  } catch (error) {
    console.error('Error Create :', error);

    return NextResponse.json({ message: 'พบข้อผิดพลาด', type: 'error' });
  }
}
