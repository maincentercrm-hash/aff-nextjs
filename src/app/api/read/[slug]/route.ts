import { NextResponse, type NextRequest } from 'next/server';


import { connectDB } from '@/configs/mongodb';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {



    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(params.slug);

    // Connect to MongoDB
    await client.connect();

    // Find all city
    const cursor = collection.find({}).sort({ createDate: -1 });


    let data;

    switch (params.slug) {
      case 'tbl_client':
        // If the table is tbl_mission_logs, apply the aggregation pipeline with sort stage
        data = await collection.aggregate([
          {
            "$lookup": {
              "from": "tbl_client_point",
              "localField": "tel",
              "foreignField": "tel",
              "as": "points"
            }
          },
          {
            "$addFields": {
              "point": { "$arrayElemAt": ["$points.point", 0] }
            }
          },
          {
            "$project": {
              "points": 0
            }
          },
          {
            "$sort": { "createDate": -1 } // Sort by createDate in descending order
          }
        ]).toArray();
        break;

      case 'tbl_campaign':
        // If the table is tbl_mission_logs, apply the aggregation pipeline with sort stage
        data = await collection.aggregate([
          {
            "$lookup": {
              "from": "tbl_client",
              "localField": "users.userId",
              "foreignField": "userId",
              "as": "userDetails"
            }
          },
          {
            "$addFields": {
              "users": {
                "$map": {
                  "input": "$users",
                  "as": "user",
                  "in": {
                    "userId": "$$user.userId",
                    "click": "$$user.click",
                    "active": "$$user.active",
                    "displayName": {
                      "$arrayElemAt": [
                        {
                          "$map": {
                            "input": {
                              "$filter": {
                                "input": "$userDetails",
                                "cond": {
                                  "$eq": ["$$this.userId", "$$user.userId"]
                                }
                              }
                            },
                            "as": "detail",
                            "in": "$$detail.displayName"
                          }
                        },
                        0
                      ]
                    },
                    "pictureUrl": {
                      "$arrayElemAt": [
                        {
                          "$map": {
                            "input": {
                              "$filter": {
                                "input": "$userDetails",
                                "cond": {
                                  "$eq": ["$$this.userId", "$$user.userId"]
                                }
                              }
                            },
                            "as": "detail",
                            "in": "$$detail.pictureUrl"
                          }
                        },
                        0
                      ]
                    }
                  }
                }
              }
            }
          },
          {
            "$project": {
              "_id": 1,
              "thumbnail": 1,
              "target": 1,
              "volumn": 1,
              "click": 1,
              "active": 1,
              "title": 1,
              "detail": 1,
              "createDate": 1,
              "users": 1
            }
          }
        ]
        ).toArray();
        break;


      case 'tbl_setting_log':
        data = await collection.aggregate([
          {
            "$addFields": {
              "settingIdObj": { "$toObjectId": "$settingId" }
            }
          },
          {
            "$lookup": {
              "from": "tbl_setting",
              "localField": "settingIdObj",
              "foreignField": "_id",
              "as": "setting"
            }
          },
          {
            "$addFields": {
              "settingTitle": { "$arrayElemAt": ["$setting.title", 0] }
            }
          },
          {
            "$unset": ["setting", "settingIdObj"]  // ลบ fields ที่ไม่ต้องการ
          },
          {
            "$sort": { "createDate": -1 }
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
      return NextResponse.json({ status: false, message: "Data Not Found !!!" });
    }


  } catch (error) {
    console.error('Error Read Data:', error);

    // Return a generic internal server error message
    return NextResponse.json({ message: 'Internal server error' });
  }
}

export const dynamic = "force-dynamic";
