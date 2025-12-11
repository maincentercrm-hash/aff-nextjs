import { NextResponse } from 'next/server';

import { ref, getDownloadURL } from 'firebase/storage';

import { storage } from '@/configs/firebase-config';

export async function POST(req: Request) {
  try {
    const { metadata } = await req.json();

    const storageRef = ref(storage, metadata.fullPath);
    const fileUrl = await getDownloadURL(storageRef);

    return NextResponse.json({ downloadUrl: fileUrl });
  } catch (error) {
    console.error('Error during file download:', error);

    return NextResponse.json({ message: 'Error occurred', type: error }, { status: 500 });
  }
}
