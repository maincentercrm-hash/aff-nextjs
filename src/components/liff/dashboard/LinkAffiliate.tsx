import React, { useState } from 'react';

import Button from '@mui/material/Button';

import type { Config } from '@/types/typeConfig';

type propsLinkAffiliate = {
  linkAffiliate: string;
  configs: Config | null
};

const Income = ({ linkAffiliate, configs }: propsLinkAffiliate) => {
  const [text, setText] = useState('คัดลอกลิ้งค์');
  const [color, setColor] = useState<'primary' | 'success'>('primary');

  const handleCopy = () => {
    navigator.clipboard.writeText(linkAffiliate)
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
    <div
      className="grid grid-cols-[68%_1fr] gap-1 text-center rounded-xl p-2 mb-auto shadow-xs overflow-hidden"
      style={{ background: configs?.dashboard.section_url.bg }}
    >
      <div className="flex overflow-hidden">
        <p className="text-xs my-auto w-full bg-white px-2 py-2 rounded-full truncate overflow-hidden">{linkAffiliate}</p>
      </div>
      <div className="flex">
        <Button
          variant="contained"
          size="small"
          color={color}
          startIcon={<i className="tabler-copy text-[18px]" />}
          className="p-2 whitespace-nowrap my-auto rounded-full  text-black"
          style={{
            background: configs?.dashboard.section_url.button_color,
            color: configs?.dashboard.section_url.button_text_color
          }}
          onClick={handleCopy}
        >
          {text}
        </Button>
      </div>
    </div>
  );
};

export default Income;
