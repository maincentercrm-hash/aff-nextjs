import { NextResponse } from 'next/server';

import { ObjectId } from 'mongodb';

import { connectDB } from '@/configs/mongodb';

export async function POST(req: Request) {
  try {
    const { table, campaign, key, userId } = await req.json();

    const client = await connectDB();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(table);

    await client.connect();


    const existingCampaign = await collection.findOne({ _id: new ObjectId(campaign) });


    if (existingCampaign) {
      // ถ้าพบ campaign ให้ทำการอัปเดตค่า key โดยเพิ่มขึ้น 1
      await collection.updateOne(
        { _id: new ObjectId(campaign) },
        { $inc: { [key]: 1 } }
      );

      await collection.updateOne(
        { _id: new ObjectId(campaign), "users.userId": userId },
        { $inc: { [`users.$[elem].${key}`]: 1 } },
        { arrayFilters: [{ "elem.userId": userId }] }
      );

      await client.close();

      return NextResponse.json({ message: 'Update Success !!!', userId: userId });
    } else {
      await client.close();

      return NextResponse.json({ message: 'Campaign not found', type: 'error' });
    }


    // Return the ID of the newly created document
    return NextResponse.json({ message: 'Update Success !!!' });
  } catch (error) {
    console.error('Error Update :', error);

    return NextResponse.json({ message: 'พบข้อผิดพลาด', type: 'error' });
  }
}
