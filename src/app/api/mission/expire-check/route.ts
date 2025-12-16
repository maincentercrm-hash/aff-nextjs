import { NextResponse } from "next/server"

import { ObjectId } from "mongodb"

import { connectDB } from "@/configs/mongodb"

/**
 * API Endpoint: /api/mission/expire-check
 * Method: GET หรือ POST
 *
 * ใช้สำหรับ check และ update mission logs ที่หมดเวลาแล้ว
 * ควรเรียกจาก cron job ทุก 1 ชั่วโมง หรือตามต้องการ
 */
export async function GET() {
  return handleExpireCheck()
}

export async function POST() {
  return handleExpireCheck()
}

async function handleExpireCheck() {
  try {
    const client = await connectDB()
    const database = client.db(process.env.DB_NAME)

    const now = new Date()
    const nowISO = now.toISOString()

    // 1. Update tbl_mission ที่หมดเวลา (mission หลัก)
    const missionsCollection = database.collection('tbl_mission')

    const expiredMissionsResult = await missionsCollection.updateMany(
      {
        status: 'publish',
        $or: [
          { end_date: { $type: 'string', $lt: nowISO } },
          { end_date: { $type: 'date', $lt: now } }
        ]
      },
      {
        $set: {
          status: 'expire',
          updateDate: nowISO
        }
      }
    )

    const expiredMissionsCount = expiredMissionsResult.modifiedCount

    // 2. Update tbl_mission_logs - ต้อง join กับ tbl_mission เพื่อดึง end_date
    const missionLogsCollection = database.collection('tbl_mission_logs')

    // หา active logs และ join กับ mission เพื่อดึง end_date
    const activeLogsWithMission = await missionLogsCollection.aggregate([
      {
        $match: {
          status: 'active'
        }
      },
      {
        $addFields: {
          mission_id_obj: {
            $cond: {
              if: { $and: [{ $ne: ["$mission_id", null] }, { $ne: ["$mission_id", ""] }] },
              then: { $toObjectId: "$mission_id" },
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: "tbl_mission",
          localField: "mission_id_obj",
          foreignField: "_id",
          as: "mission"
        }
      },
      {
        $unwind: {
          path: "$mission",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          // ใช้ end_date จาก log ก่อน ถ้าไม่มีให้ใช้จาก mission
          effective_end_date: {
            $ifNull: ["$end_date", "$mission.end_date"]
          }
        }
      },
      {
        $match: {
          $or: [
            { effective_end_date: { $type: 'string', $lt: nowISO } },
            { effective_end_date: { $type: 'date', $lt: now } }
          ]
        }
      }
    ]).toArray()

    console.log(`Found ${activeLogsWithMission.length} expired mission logs`)

    // Update แต่ละ log
    let expiredLogsCount = 0

    for (const log of activeLogsWithMission) {
      await missionLogsCollection.updateOne(
        { _id: new ObjectId(log._id) },
        {
          $set: {
            status: 'expire',
            updateDate: nowISO
          }
        }
      )
      expiredLogsCount++
    }

    await client.close()

    const result = {
      message: "Expire check completed",
      type: "success",
      timestamp: nowISO,
      expiredMissionLogs: expiredLogsCount,
      expiredMissions: expiredMissionsCount,
      debug: {
        currentTime: nowISO,
        logsFound: activeLogsWithMission.length,
        logsUpdated: expiredLogsCount,
        missionsUpdated: expiredMissionsCount
      }
    }

    console.log('Expire check result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in expire-check:", error)

    return NextResponse.json(
      {
        message: "Error checking expired missions",
        type: "error",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
