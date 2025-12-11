// app/api/upload/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    // สร้าง URL จำลอง (ในการใช้งานจริงควรอัพโหลดไปที่ storage จริง)
    const url = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: url
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to upload file'
    }, { status: 500 });
  }
}
