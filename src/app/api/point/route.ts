import { NextResponse } from "next/server";

import { connectDB } from "@/configs/mongodb";

export async function PATCH(req: Request) {
  try {
    const { table, data } = await req.json();

    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(table);

    // Ensure tel exists (primary identifier)
    if (!data.tel) {
      await client.close();

      return NextResponse.json({
        message: "Tel is required",
        type: "error"
      });
    }

    await client.connect();

    // Convert point to number if it exists
    if (data.point) {
      data.point = Number(data.point);

      // Validate point is a valid number
      if (isNaN(data.point)) {
        await client.close();

        return NextResponse.json({
          message: "Invalid point value",
          type: "error"
        });
      }
    }

    // Extract data - use tel as primary identifier for stability
    const { tel, point, operation, userId } = data;
    const currentDate = new Date().toISOString();

    // Determine the update operation
    let updateOperation;

    if (operation === '+') {
      updateOperation = {
        $inc: { point: point },
        $set: {
          updateDate: currentDate,
          userId: userId, // Update userId in case it changed
          lastPointOperation: {
            type: 'add',
            amount: point,
            date: currentDate
          }
        }
      };
    } else if (operation === '-') {
      // Check if user has enough points before deducting (search by tel)
      const user = await collection.findOne({ tel });

      if (!user || user.point < point) {
        await client.close();

        return NextResponse.json({
          message: "Insufficient points",
          type: "error"
        });
      }

      updateOperation = {
        $inc: { point: -point },
        $set: {
          updateDate: currentDate,
          userId: userId, // Update userId in case it changed
          lastPointOperation: {
            type: 'subtract',
            amount: point,
            date: currentDate
          }
        }
      };
    } else {
      await client.close();

      return NextResponse.json({
        message: "Invalid operation",
        type: "error"
      });
    }

    // Update the document by tel using $inc for point adjustment
    const result = await collection.updateOne(
      { tel },
      updateOperation
    );

    await client.close();

    if (result.modifiedCount === 0) {
      return NextResponse.json({
        message: "User not found",
        type: "error",
        details: {
          tel,
          userId,
          operation,
          point
        }
      });
    }

    // Success response with details
    return NextResponse.json({
      message: "Points updated successfully",
      type: "success",
      details: {
        tel,
        userId,
        operation,
        point,
        timestamp: currentDate
      }
    });

  } catch (error) {
    console.error("Error updating points:", error);

    return NextResponse.json({
      message: "Internal server error while updating points",
      type: "error",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const dynamic = "force-dynamic";
