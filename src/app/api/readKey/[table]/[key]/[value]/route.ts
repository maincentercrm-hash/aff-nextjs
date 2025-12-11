import { NextResponse, type NextRequest } from 'next/server';

import { connectDB } from '@/configs/mongodb';

export async function GET(req: NextRequest, { params }: { params: { table: string, key: string, value: string } }) {
  try {
    const { table, key, value } = params;

    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(table);

    await client.connect();

    let data;

    switch (table) {
      case 'tbl_mission_logs':
        // Add match stage at the beginning of pipeline to filter by userId
        data = await collection.aggregate([
          {
            "$match": {
              [key]: value  // This will match the userId field with the provided value
            }
          },
          {
            "$lookup": {
              "from": "tbl_mission",
              "localField": "mission_id",
              "foreignField": "_id",
              "as": "missionDetails"
            }
          },
          {
            "$unwind": "$missionDetails"
          },
          {
            "$project": {
              "userId": 1,
              "tel": 1,
              "mission_id": 1,
              "status": 1,
              "createDate": 1,
              "missionDetails.title": 1,
              "missionDetails.type": 1,
              "missionDetails.condition": 1,
              "missionDetails.session": 1,
              "missionDetails.start_date": 1,
              "missionDetails.end_date": 1,
              "missionDetails.point": 1
            }
          },
          {
            "$sort": { "createDate": -1 }
          }
        ]).toArray();

        // Log for debugging
        //console.log(`Searching for ${key}: ${value}`);
        // console.log('Found records:', data.length);
        break;

      case 'tbl_mission':
        data = await collection.aggregate([
          {
            $addFields: {
              end_date_converted: {
                $dateFromString: {
                  dateString: "$end_date",
                  timezone: "UTC"
                }
              }
            }
          },
          {
            $match: {
              end_date_converted: { $gt: new Date() }
            }
          },
          {
            "$sort": { "createDate": -1 }
          },
          {
            $project: {
              end_date_converted: 0
            }
          }
        ]).toArray();
        break;


      case 'tbl_point':
        data = await collection.find({ [key]: value })
          .sort({ point: 1 }) // 1 คือเรียงจากน้อยไปมาก, -1 คือมากไปน้อย
          .toArray();
        break;

      default:
        // Add logging for default case
        //  console.log(`Default search for ${key}: ${value}`);
        data = await collection.find({ [key]: value })
          .sort({ createDate: -1 })
          .toArray();

        // console.log('Found records:', data.length);
        break;
    }

    await client.close();

    // Validate the response data
    if (data && data.length > 0) {
      // Add additional check for userId match in returned data
      if (key === 'userId') {
        const validData = data.filter(item => item.userId === value);

        if (validData.length > 0) {
          return NextResponse.json(validData);
        } else {
          return NextResponse.json({
            status: false,
            message: "No matching records found for this userId"
          });
        }
      }


      return NextResponse.json(data);
    } else {
      return NextResponse.json({
        status: false,
        message: "Data Not Found !!!",
        searchParams: { table, key, value } // Add search parameters for debugging
      });
    }
  } catch (error) {
    console.error('Error Read Data:', error);

    return NextResponse.json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const dynamic = "force-dynamic";
