

import { NextResponse, type NextRequest } from 'next/server';

import { connectDB } from '@/configs/mongodb';

export async function POST(req: NextRequest) {


  try {
    // อ่านข้อมูลจาก request body
    const body = await req.json();

    // ตรวจสอบลายเซ็น


    // console.log(body)

    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection('tbl_line_log');

    await client.connect();
    await collection.insertOne(body.events[0]);
    await client.close();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // จัดการกับ error ที่อาจเกิดขึ้น
    console.error(error);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
