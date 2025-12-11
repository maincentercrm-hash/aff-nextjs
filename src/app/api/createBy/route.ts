import { NextResponse } from 'next/server';

import { ObjectId } from 'mongodb';

import { connectDB } from '@/configs/mongodb';

export async function POST(req: Request) {
  const client = await connectDB(); // Ensure this is connected first

  try {
    const { table, data, key } = await req.json();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(table);
    const currentDate = new Date().toISOString();

    if (data.client_id) {
      data.client_id = new ObjectId(data.client_id);
    }

    // Define the filter to check if the document with the specified key exists
    const filter = { [key]: data[key] };

    // Check if the document exists
    const existingDocument = await collection.findOne(filter);

    if (existingDocument) {
      // If document exists, update the existing document

      if (table === 'tbl_client_point') {
        delete data.point
      }

      const updateDocument = { $set: data };



      const result = await collection.updateOne(filter, updateDocument);

      if (result.modifiedCount > 0) {
        return NextResponse.json({
          message: 'Update Success !!!',
          _id: existingDocument._id.toString() // Convert ObjectId to string
        });
      } else {
        return NextResponse.json({
          message: 'Update Success !!!',
          _id: existingDocument._id.toString() // Convert ObjectId to string
        });
      }
    } else {
      // If document does not exist, insert a new document
      data.createDate = currentDate;

      const result = await collection.insertOne(data);

      return NextResponse.json({
        message: 'Create Success !!!',
        _id: result.insertedId.toString() // Convert ObjectId to string
      });
    }
  } catch (error) {
    console.error('Error Create :', error);

    return NextResponse.json({ message: 'พบข้อผิดพลาด', type: 'error' });
  } finally {
    await client.close(); // Ensure client is closed after all operations
  }
}
