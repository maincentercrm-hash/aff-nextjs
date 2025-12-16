import { NextResponse } from "next/server"

import { connectDB } from "@/configs/mongodb"

/**
 * API Endpoint: /api/mission/expire-check
 * Method: GET หรือ POST
 *
 * ใช้สำหรับ check และ update mission logs ที่หมดเวลาแล้ว
 * ควรเรียกจาก cron job ทุก 1 ชั่วโมง หรือตามต้องการ
 *
 * Flow:
 * 1. Query tbl_mission_logs ที่ status = 'active' และ end_date < current date
 * 2. Update status เป็น 'expire'
 * 3. Return จำนวน missions ที่ถูก expire
 */
export async function GET() {
  return handleExpireCheck()
}

export async function POST() {
  return handleExpireCheck()
}

async function handleExpireCheck() {
  try {
    // Optional: ตรวจสอบ API key สำหรับ security
    // ถ้าต้องการ security สามารถ uncomment และตั้ง API_CRON_KEY ใน .env
    // const { searchParams } = new URL(req.url)
    // const apiKey = searchParams.get('key')
    // if (apiKey !== process.env.API_CRON_KEY) {
    //   return NextResponse.json({ message: "Unauthorized", type: "error" }, { status: 401 })
    // }

    const client = await connectDB()
    const database = client.db(process.env.DB_NAME)

    const now = new Date()

    // 1. Update tbl_mission_logs ที่หมดเวลา
    const missionLogsCollection = database.collection('tbl_mission_logs')

    // หา logs ที่ status = 'active' และ end_date < now
    const expiredLogs = await missionLogsCollection.find({
      status: 'active',
      end_date: { $lt: now.toISOString() }
    }).toArray()

    console.log(`Found ${expiredLogs.length} expired mission logs`)

    // Update ทุก expired logs
    let expiredLogsCount = 0

    if (expiredLogs.length > 0) {
      const updateLogsResult = await missionLogsCollection.updateMany(
        {
          status: 'active',
          end_date: { $lt: now.toISOString() }
        },
        {
          $set: {
            status: 'expire',
            updateDate: now.toISOString()
          }
        }
      )

      expiredLogsCount = updateLogsResult.modifiedCount
    }

    // 2. Optional: Update tbl_mission ที่หมดเวลาทั้งหมด (ถ้า mission หลักหมดเวลา)
    const missionsCollection = database.collection('tbl_mission')

    const expiredMissionsResult = await missionsCollection.updateMany(
      {
        status: 'publish',
        end_date: { $lt: now.toISOString() }
      },
      {
        $set: {
          status: 'expire',
          updateDate: now.toISOString()
        }
      }
    )

    const expiredMissionsCount = expiredMissionsResult.modifiedCount

    await client.close()

    const result = {
      message: "Expire check completed",
      type: "success",
      timestamp: now.toISOString(),
      expiredMissionLogs: expiredLogsCount,
      expiredMissions: expiredMissionsCount,
      details: {
        logsFound: expiredLogs.length,
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
