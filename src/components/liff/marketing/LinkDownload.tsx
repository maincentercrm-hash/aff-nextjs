import { useState } from "react";

import CircularProgress from "@mui/material/CircularProgress";

import actionDownload from "@/action/crud/download";

type PropsDownload = {
  url: string;
}


const LinkDownload = ({ url }: PropsDownload) => {
  const [isLoading, setLoading] = useState<boolean>(false);

  const handleDownload = async (url: string) => {
    setLoading(true);

    try {
      const downloadUrl = await actionDownload(url);

      window.open(downloadUrl, '_blank');

      setLoading(false);
    } catch (error) {
      console.error('Download failed:', error);
      setLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="w-full h-full relative flex">
          <CircularProgress className='m-auto' size={24} />
        </div>
      ) : (
        <i
          className="tabler-download m-auto cursor-pointer"
          onClick={() => handleDownload(url)}
        ></i>
      )}
    </>
  )
}

export default LinkDownload;
