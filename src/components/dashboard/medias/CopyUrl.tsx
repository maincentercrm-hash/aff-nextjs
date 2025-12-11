import { useState } from "react";

import Button from "@mui/material/Button"


type CopyUrlProps = {
  url: string;
}

const CopyUrl = ({ url }: CopyUrlProps) => {

  const [text, setText] = useState('คัดลอกลิ้งค์');
  const [color, setColor] = useState<'primary' | 'success'>('primary');

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setText('คัดลอกแล้ว');
        setColor('success');

        setTimeout(() => {
          setText('คัดลอกลิ้งค์');
          setColor('primary');
        }, 3000);
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  return (
    <Button
      variant="contained"
      color={color}
      size="small"
      startIcon={<i className="tabler-copy text-[18px]" />}
      className="whitespace-nowrap flex mt-2"
      onClick={handleCopy}
    >
      {text}
    </Button>
  )
}

export default CopyUrl
