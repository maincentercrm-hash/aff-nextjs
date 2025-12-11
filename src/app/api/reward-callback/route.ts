import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { connectDB } from "@/configs/mongodb";

/**
 * POST /api/reward-callback
 *
 * รับ Callback จาก External API เมื่อมีการ approve/reject การแลกรางวัล credit
 *
 * Request Body:
 * {
 *   "log_id": "674f1234567890abcdef1234",
 *   "status": "approve" | "reject"
 * }
 */
export async function POST(req: Request) {
  let client = null;

  try {
    const body = await req.json();
    const { log_id, status } = body;

    console.log('Reward callback received:', { log_id, status });

    // Validate required fields
    if (!log_id || !status) {
      return NextResponse.json({
        message: "Missing required fields: log_id and status",
        type: "error"
      }, { status: 400 });
    }

    // Validate status value
    if (!['approve', 'reject'].includes(status)) {
      return NextResponse.json({
        message: "Invalid status. Must be 'approve' or 'reject'",
        type: "error"
      }, { status: 400 });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(log_id)) {
      return NextResponse.json({
        message: "Invalid log_id format",
        type: "error"
      }, { status: 400 });
    }

    client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const logCollection = database.collection('tbl_point_logs');
    const pointCollection = database.collection('tbl_client_point');

    // Find the log entry
    const logEntry = await logCollection.findOne({
      _id: new ObjectId(log_id)
    });

    if (!logEntry) {
      return NextResponse.json({
        message: "Log entry not found",
        type: "error"
      }, { status: 404 });
    }

    // Check if log is already processed (idempotency)
    if (logEntry.status !== 'pending') {
      return NextResponse.json({
        message: "Log already processed",
        type: "info",
        log_id,
        current_status: logEntry.status
      });
    }

    // Check if this is a credit type reward
    if (logEntry.type !== 'credit') {
      return NextResponse.json({
        message: "This log is not a credit type reward",
        type: "error"
      }, { status: 400 });
    }

    const currentDate = new Date().toISOString();

    if (status === 'approve') {
      // Approve: Update log status to complete
      await logCollection.updateOne(
        { _id: new ObjectId(log_id) },
        {
          $set: {
            status: 'complete',
            callback_time: currentDate,
            updateDate: currentDate
          }
        }
      );

      console.log('Reward approved:', { log_id });

      return NextResponse.json({
        message: "Reward approved successfully",
        type: "success",
        log_id,
        status: "complete",
        callback_time: currentDate
      });

    } else if (status === 'reject') {
      // Reject: Update log status and refund points
      const pointToRefund = Number(logEntry.point);

      if (isNaN(pointToRefund) || pointToRefund <= 0) {
        return NextResponse.json({
          message: "Invalid point value in log entry",
          type: "error"
        }, { status: 400 });
      }

      // Update log status to rejected
      await logCollection.updateOne(
        { _id: new ObjectId(log_id) },
        {
          $set: {
            status: 'rejected',
            callback_time: currentDate,
            updateDate: currentDate
          }
        }
      );

      // Refund points to user
      const refundResult = await pointCollection.updateOne(
        { userId: logEntry.userId },
        {
          $inc: { point: pointToRefund },
          $set: {
            updateDate: currentDate,
            lastPointOperation: {
              type: 'refund',
              amount: pointToRefund,
              date: currentDate,
              reason: 'credit_reward_rejected',
              log_id: log_id
            }
          }
        }
      );

      // Create refund log entry
      await logCollection.insertOne({
        userId: logEntry.userId,
        tel: logEntry.tel,
        point: String(pointToRefund),
        operation: '+',
        title: `คืน Point จากการแลก: ${logEntry.title} (ถูกปฏิเสธ)`,
        type: 'default',
        status: 'complete',
        refund_for_log_id: log_id,
        createDate: currentDate
      });

      console.log('Reward rejected, points refunded:', {
        log_id,
        points_refunded: pointToRefund,
        user_id: logEntry.userId
      });

      return NextResponse.json({
        message: "Reward rejected, points refunded",
        type: "success",
        log_id,
        status: "rejected",
        points_refunded: pointToRefund,
        callback_time: currentDate,
        refund_applied: refundResult.modifiedCount > 0
      });
    }

    // This should never be reached, but just in case
    return NextResponse.json({
      message: "Unknown status",
      type: "error"
    }, { status: 400 });

  } catch (error) {
    console.error("Error processing reward callback:", error);

    return NextResponse.json({
      message: "Internal server error",
      type: "error",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });

  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
}

export const dynamic = "force-dynamic";
