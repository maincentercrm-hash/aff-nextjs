import { NextResponse } from 'next/server';

import { hash } from 'bcrypt';

import { connectDB } from '@/configs/db';
import type { IUser } from '@/models/modelUser';
import ModelUser from '@/models/modelUser';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Check if email and password are provided
    if (!email || !password) {
      return NextResponse.json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', type: 'warning' });
    }

    await connectDB();

    // Check if email already exists in the collection
    const existingUser: IUser | null = await ModelUser.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: 'มีบัญชีอีเมลนี้ในระบบแล้ว', type: 'error' });
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const newUser = new ModelUser({
      email,
      password: hashedPassword,
      role: 'guest',
      status: 'pending',
      createDate: new Date(),
    });

    await newUser.save();

    return NextResponse.json({ message: 'ลงทะเบียนเสร็จสมบูรณ์ กรุณาเข้าสู่ระบบ', type: 'success' });
  } catch (error) {
    console.error('Error registering user:', error);

    return NextResponse.json({ message: 'พบข้อผิดพลาด', type: 'error' });
  }
}
