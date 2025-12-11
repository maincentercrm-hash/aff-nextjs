import { NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ status: false, message: 'Authorization header is missing' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // eslint-disable-next-line import/no-named-as-default-member
      const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);

      return NextResponse.json({ status: true, decoded: decoded });
    } catch (error) {
      return NextResponse.json({ status: false });
    }

    // Return user data
    // return NextResponse.json({ message: 'User found', user });
  } catch (error) {
    console.error('Error finding user:', error);

    return NextResponse.json({ status: false, message: 'Internal server error' });
  }
}

export const dynamic = "force-dynamic";
