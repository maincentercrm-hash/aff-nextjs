// src/action/config/useImageUpload.ts
import { useState } from 'react';

import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';

import { storage } from '@/configs/firebase-config';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      // สร้าง unique filename
      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
      const filename = `${timestamp}-${originalName}`;

      // สร้าง reference ไปยัง path ที่จะเก็บไฟล์
      const storageRef = ref(storage, `uploads/${filename}`);

      // อัพโหลดไฟล์
      const snapshot = await uploadBytes(storageRef, file);

      // ขอ URL สำหรับเข้าถึงไฟล์
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
};
