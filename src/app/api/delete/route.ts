// Import necessary modules
import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { connectDB } from "@/configs/mongodb";

// Define the DELETE function
export async function DELETE(req: Request) {
  try {
    // Extract data from the request body
    const { table, id } = await req.json();

    // Connect to the database
    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(table);

    // Connect to the database
    await client.connect();

    // Delete the period by _id
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    // Close the database connection
    await client.close();

    // Check if the delete operation was successful
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Not Found !!! ID", type: "error", data: id });
    }

    // Return success response
    return NextResponse.json({ message: "Delete Complete !!!", type: "success" });
  } catch (error) {
    console.error("Error Delete :", error);

    return NextResponse.json({ message: "เกิดข้อผิดพลาดขณะลบข้อมูล", type: "error" });
  }
}
