// app/api/reports/missions/route.ts
import { NextResponse, type NextRequest } from 'next/server';

import { connectDB } from '@/configs/mongodb';

export async function GET(req: NextRequest) {
  let client;

  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json({ status: false, message: "Missing date range" });
    }

    client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const missionLogsCollection = database.collection('tbl_mission_logs');

    // 1. Get mission logs data
    const missionData = await missionLogsCollection.aggregate([
      {
        $match: {
          createDate: {
            $gte: new Date(new Date(start).getTime() - (7 * 60 * 60 * 1000)).toISOString(),
            $lte: new Date(new Date(end).getTime() - (7 * 60 * 60 * 1000)).toISOString()
          }
        }
      },
      {
        $addFields: {
          source: {
            $cond: {
              if: { $ifNull: ["$mission_id", false] },
              then: "mission",
              else: {
                $cond: {
                  if: { $ifNull: ["$settingId", false] },
                  then: "setting",
                  else: "point"
                }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "tbl_mission",
          let: {
            missionId: {
              $cond: {
                if: { $ifNull: ["$mission_id", false] },
                then: { $toObjectId: "$mission_id" },
                else: null
              }
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$missionId"] }
                  ]
                }
              }
            }
          ],
          as: "missionDetails"
        }
      },
      {
        $lookup: {
          from: "tbl_setting",
          let: {
            settingId: {
              $cond: {
                if: { $ifNull: ["$settingId", false] },
                then: { $toObjectId: "$settingId" },
                else: null
              }
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$settingId"] }
                  ]
                }
              }
            }
          ],
          as: "settingDetails"
        }
      },
      {
        $addFields: {
          details: {
            $cond: {
              if: { $eq: ["$source", "mission"] },
              then: { $arrayElemAt: ["$missionDetails", 0] },
              else: {
                $cond: {
                  if: { $eq: ["$source", "setting"] },
                  then: { $arrayElemAt: ["$settingDetails", 0] },
                  else: null
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $add: [
                  { $dateFromString: { dateString: "$createDate" } },
                  25200000 // 7 hours in milliseconds for UTC+7
                ]
              }
            }
          },
          missions: {
            $push: {
              _id: "$_id",
              tel: "$tel",
              title: {
                $cond: {
                  if: { $eq: ["$source", "mission"] },
                  then: { $ifNull: ["$details.title", "N/A"] },
                  else: "$title"
                }
              },
              type: {
                $cond: {
                  if: { $eq: ["$source", "mission"] },
                  then: { $ifNull: ["$details.type", "N/A"] },
                  else: "$source"
                }
              },
              point: { $ifNull: ["$point", 0] },
              status: {
                $cond: {
                  if: { $eq: ["$source", "mission"] },
                  then: { $ifNull: ["$status", "pending"] },
                  else: "complete"
                }
              },
              createDate: "$createDate",
              completeDate: "$completeDate",
              condition: {
                $cond: {
                  if: { $eq: ["$source", "mission"] },
                  then: { $ifNull: ["$details.condition", "N/A"] },
                  else: "N/A"
                }
              }
            }
          },
          totalMissions: { $sum: 1 },
          completedMissions: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "complete"] },
                    { $eq: ["$source", "setting"] },
                    { $eq: ["$source", "point"] }
                  ]
                },
                1,
                0
              ]
            }
          },
          pendingMissions: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$source", "mission"] },
                    {
                      $or: [
                        { $eq: ["$status", "pending"] },
                        { $eq: ["$status", "active"] }
                      ]
                    }
                  ]
                },
                1,
                0
              ]
            }
          },
          expiredMissions: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$source", "mission"] },
                    { $eq: ["$status", "expire"] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalPoints: { $sum: { $ifNull: ["$point", 0] } }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]).toArray();

    const dailyReports = missionData.map(day => ({
      date: day._id,
      missions: day.missions,
      summary: {
        totalMissions: day.totalMissions,
        completedMissions: day.completedMissions,
        pendingMissions: day.pendingMissions,
        expiredMissions: day.expiredMissions,
        totalPoints: day.totalPoints
      }
    }));

    const summary = dailyReports.reduce(
      (acc, day) => ({
        totalMissions: acc.totalMissions + day.summary.totalMissions,
        completedMissions: acc.completedMissions + day.summary.completedMissions,
        pendingMissions: acc.pendingMissions + day.summary.pendingMissions,
        expiredMissions: acc.expiredMissions + day.summary.expiredMissions,
        totalPoints: acc.totalPoints + day.summary.totalPoints
      }),
      { totalMissions: 0, completedMissions: 0, pendingMissions: 0, expiredMissions: 0, totalPoints: 0 }
    );

    if (dailyReports.length > 0) {
      return NextResponse.json({
        summary,
        dailyReports
      });
    } else {
      return NextResponse.json({
        status: false,
        message: "No data found for the selected date range"
      });
    }

  } catch (error) {
    console.error('Error Read Data:', error);

    return NextResponse.json({
      status: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export const dynamic = "force-dynamic";
