import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { nanoid } from "nanoid";

import { storage } from "@/configs/firebase-config";
import actionUpload from "./upload";

const actionCreate = async (table: string, data: any) => {
  try {

    if (data.thumbnail) {
      const uniqueId = nanoid();
      const timestamp = new Date().getTime();

      // Extract file extension
      const fileName = data.thumbnail[0].name; // Assuming data.thumbnail is a File object
      const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);

      const filePath = `uploads/medias/${timestamp}_${uniqueId}.${fileExtension}`;
      const storageRef = ref(storage, filePath);

      // Upload the file to Firebase Storage with metadata
      const res = await uploadBytes(storageRef, data.thumbnail[0] as Blob);
      const downloadURL = await getDownloadURL(storageRef);

      const updatedMetadata = { ...res.metadata, url: downloadURL };

      await actionUpload('tbl_medias', updatedMetadata)

      // Assign the download URL to the thumbnail.url as per the schema
      data.thumbnail = downloadURL;
    }

    if (data.file_download) {
      const uniqueId = nanoid();
      const timestamp = new Date().getTime();

      const fileName = data.file_download[0].name; // Assuming data.thumbnail is a File object
      const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);


      const filePath = `uploads/medias/${timestamp}_${uniqueId}.${fileExtension}`;
      const storageRef = ref(storage, filePath);

      // Upload the file to Firebase Storage with metadata
      const res = await uploadBytes(storageRef, data.file_download[0] as Blob);
      const downloadURL = await getDownloadURL(storageRef);

      const updatedMetadata = { ...res.metadata, url: downloadURL };

      await actionUpload('tbl_medias', updatedMetadata)

      // Assign the download URL to the thumbnail.url as per the schema
      data.file_download = downloadURL;
    }

    if (data.media) {
      const uniqueId = nanoid();
      const timestamp = new Date().getTime();

      const fileName = data.media[0].name; // Assuming data.thumbnail is a File object
      const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);


      const filePath = `uploads/medias/${timestamp}_${uniqueId}.${fileExtension}`;
      const storageRef = ref(storage, filePath);

      // Upload the file to Firebase Storage with metadata
      const res = await uploadBytes(storageRef, data.media[0] as Blob);
      const downloadURL = await getDownloadURL(storageRef);

      const updatedMetadata = { ...res.metadata, url: downloadURL };

      await actionUpload('tbl_medias', updatedMetadata)

      return
    }





    const response = await fetch("/api/create", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ table, data })
    });

    if (!response.ok) {
      throw new Error('Failed Create');
    }

    const responseData = await response.json();


    return responseData;
  } catch (error) {
    console.error('Error Create:', error);
    throw error;
  }
};

export default actionCreate;
