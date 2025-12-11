import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { connectDB } from "@/configs/mongodb";

export async function PATCH(req: Request) {
  try {
    const { table, data } = await req.json();

    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(table);

    // Ensure a valid MongoDB ObjectId for userId
    if (!ObjectId.isValid(data._id)) {
      await client.close();

      return NextResponse.json({ message: "ID Notfound", type: "error" });
    }

    await client.connect();

    if (data.point) {
      data.point = Number(data.point);
    }

    // Extract _id from Tour and exclude it from updates
    const { _id, ...updates } = data;

    const currentDate = new Date().toISOString();

    const updateOperation = {
      $set: {
        ...updates,
        updateDate: currentDate // Adding updateDate field with current date
      }
    };


    // Update the Tour by _id using $set to perform a partial update
    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      updateOperation
    );

    await client.close();

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "Not Found Id", type: "error" });
    }

    return NextResponse.json({ message: "Update Complete !!!", type: "success" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดต:", error);

    return NextResponse.json({ message: "เกิดข้อผิดพลาดขณะอัปเดต", type: "error" });
  }
}
