import { NextResponse } from 'next/server'

import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt';

import { connectDB } from "@/configs/db";
import ModelUser from '@/models/modelUser';

export async function POST(req: Request) {

  try {
    const { email, password } = await req.json();

    // Check if email is provided
    if (!email || !password) {
      return NextResponse.json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', type: 'warning' });
    }

    await connectDB();

    // Check if email already exists in the collection
    const existingUser = await ModelUser.findOne({ email })


    if (existingUser) {
      // eslint-disable-next-line import/no-named-as-default-member
      const isMatch = await bcrypt.compare(password, existingUser.password);

      if (isMatch) {
        // Password matches

        // eslint-disable-next-line import/no-named-as-default-member
        const token = jwt.sign(
          {
            id: existingUser._id,
            email: existingUser.email,
            role: existingUser.role
          },
          `${process.env.JWT_SECRET}` || '', // Use secret key from environment variable
          { expiresIn: '12h' }
        );

        return NextResponse.json({ message: 'ข้อมูลถูกต้อง กดที่ปุ่มด้านล่างเพื่อใช้งาน', type: 'success', email: existingUser.email, token: token });
      } else {
        // Password does not match
        return NextResponse.json({ message: 'รหัสผ่านไม่ถูกต้อง', type: 'error' });
      }

    } else {
      return NextResponse.json({ message: 'ไม่พบบัญชีอีเมลนี้ในระบบ', type: 'error' }); // Conflict status for duplicate
    }


  } catch (error) {
    console.error('Error registering user:', error);

    return NextResponse.json({ message: 'พบข้อผิดพลาด', type: 'error' });
  }

}
