import { nanoid } from 'nanoid';
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";

import { storage } from "@/configs/firebase-config";
import actionUpload from './upload';

const actionUpdate = async (table: string, data: any) => {


  try {

    if (Array.isArray(data.thumbnail) && data.thumbnail.length > 0) {
      const uniqueId = nanoid();
      const timestamp = new Date().getTime();

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


    if (Array.isArray(data.file_download) && data.file_download.length > 0) {
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


    const response = await fetch("/api/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ table: table, data: data })
    });



    if (!response.ok) {
      throw new Error("Failed Update");
    }

    const responseData = await response.json();


    return responseData;
  } catch (error) {
    console.error("Error Update:", error);
    throw error;
  }
};

export default actionUpdate;
