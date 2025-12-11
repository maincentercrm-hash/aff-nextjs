import { NextResponse, type NextRequest } from 'next/server';

import { connectDB } from '@/configs/mongodb';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const client = await connectDB(); // เชื่อมต่อ MongoDB
    const database = client.db(process.env.DB_NAME); // เลือกฐานข้อมูล
    const collection = database.collection(params.slug); // เลือกคอลเล็กชัน

    const currentDate = new Date();

    //currentDate.setHours(0, 0, 0, 0);

    const tenDaysAgo = new Date(currentDate);

    tenDaysAgo.setDate(currentDate.getDate() - 14);

    // กำหนด aggregation pipeline
    const aggregationPipeline = [
      {
        $addFields: {
          parsedDate: {
            $dateFromString: {
              dateString: "$createDate" // แปลง string ใน createDate เป็น date
            }
          }
        }
      },
      {
        $match: {
          parsedDate: {
            $gte: tenDaysAgo,
            $lt: currentDate
          }
        }
      },
      {
        $sort: { parsedDate: -1 } // เรียงลำดับตามวันที่มากไปหาน้อย
      }
    ];

    const cursor = collection.aggregate(aggregationPipeline); // ทำ aggregation

    const data = await cursor.toArray(); // แปลงผลลัพธ์เป็น array

    await client.close(); // ปิดการเชื่อมต่อ MongoDB

    if (data.length > 0) {
      return NextResponse.json(data); // ส่งข้อมูลกลับให้กับ client ในรูปแบบ JSON
    } else {
      return NextResponse.json({ status: false, message: "Data Not Found !!!" }); // ถ้าไม่มีข้อมูลในช่วงเวลาที่กำหนด
    }
  } catch (error) {
    console.error('Error Read Data:', error);

    return NextResponse.json({ message: 'Internal server error' }); // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  }
}

export const dynamic = "force-dynamic";
