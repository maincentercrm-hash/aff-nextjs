// app/api/configs/route.ts
import { NextResponse } from 'next/server';

import { connectDB } from '@/configs/mongodb';
import type { Config } from '@/types/typeConfig';

// GET: ดึงข้อมูล config
export async function GET() {
  try {
    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection('tbl_configs');

    const config = await collection.findOne({});

    await client.close();

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching config:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch config'
    }, { status: 500 });
  }
}

// PUT: อัพเดท config

type UpdateDataType = Partial<{ [K in keyof Config]: Partial<Config[K]> }>;

export async function PUT(req: Request) {
  try {
    const { config: updateData } = await req.json() as { config: UpdateDataType };

    //console.log('Received update data:', updateData);

    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection('tbl_configs');

    // ดึง config ปัจจุบัน
    const currentConfig = await collection.findOne({});

    if (!currentConfig) {
      throw new Error('Config not found');
    }

    // สร้าง update query ที่ถูกต้อง
    const updateQuery: Record<string, unknown> = {};

    // วนลูปผ่าน keys ใน updateData และสร้าง dot notation
    Object.entries(updateData as Record<string, Record<string, unknown>>).forEach(
      ([section, sectionData]) => {
        Object.entries(sectionData).forEach(([key, value]) => {
          // ใช้ dot notation สำหรับ nested objects
          updateQuery[`${section}.${key}`] = value;
        });
      }
    );

    //console.log('Update query:', updateQuery);

    const result = await collection.updateOne(
      { _id: currentConfig._id },
      { $set: updateQuery }
    );

    //console.log('MongoDB update result:', result);

    await client.close();

    if (result.modifiedCount === 0) {
      throw new Error('No document was modified');
    }

    return NextResponse.json({
      success: true,
      message: 'Config updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating config:', error);

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update config',
      error: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
