import { getMetadata, ref } from "firebase/storage";

import { storage } from "@/configs/firebase-config";

const actionDownload = async (fileUrl: string) => {
  try {
    const url = new URL(fileUrl);
    const pathname = decodeURIComponent(url.pathname);
    const filePath = pathname.split('/o/')[1].split('?alt=media')[0];

    const storageRef = ref(storage, filePath);
    const metadata = await getMetadata(storageRef);

    const response = await fetch("/api/download", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ metadata })
    });

    if (!response.ok) {
      throw new Error('Failed Create');
    }

    const { downloadUrl } = await response.json();

    return downloadUrl;
  } catch (error) {
    console.error('Error during download:', error);
    throw error;
  }
};

export default actionDownload;
