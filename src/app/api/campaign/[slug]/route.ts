import { NextResponse, type NextRequest } from 'next/server';


import { connectDB } from '@/configs/mongodb';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {

    let target = '';

    switch (params.slug) {
      case 'request_tel':
        target = 'tbl_client'
        break;

      default:
        break;
    }


    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);


    const collection = database.collection(target);

    // Connect to MongoDB
    await client.connect();

    // Find all city
    const cursor = collection.find({}).sort({ createDate: -1 });


    let data;

    switch (params.slug) {
      case 'request_tel':
        // If the table is tbl_mission_logs, apply the aggregation pipeline with sort stage
        data = await collection.aggregate([
          {
            "$match": {
              "tel": { "$exists": false }
            }
          },
          {
            "$project": {
              "_id": 0,
              "userId": 1
            }
          }
        ]).toArray();
        break;



      default:
        // If the table is not tbl_mission_logs or other specified cases, perform a regular find query with sort
        data = await cursor.sort({ createDate: -1 }).toArray();
        break;
    }


    // Iterate over the cursor to get all city


    // Close the MongoDB connection
    await client.close();

    if (data.length > 0) {
      // If city array is not empty, return the array of city
      return NextResponse.json(data);
    } else {
      // If city array is empty, return a response indicating no city were found
      return NextResponse.json([]);
    }


  } catch (error) {
    console.error('Error Read Data:', error);

    // Return a generic internal server error message
    return NextResponse.json({ message: 'Internal server error' });
  }
}

export const dynamic = "force-dynamic";
