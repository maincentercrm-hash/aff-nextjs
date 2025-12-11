import React, { useState } from 'react';

import Image from 'next/image';

import Dialog from '@mui/material/Dialog';

import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';

interface DialogShare {
  data: any;
  open: boolean;
  onClose: () => void;
}

const DialogShare = ({ data, onClose, open }: DialogShare) => {

  const [text, setText] = useState('คัดลอกลิ้งค์');
  const [color, setColor] = useState<'primary' | 'success'>('primary');

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/marketing/${data._id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
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

  const handleClose = () => {
    onClose();
  };

  const handleShare = (social: string) => {
    let url = '';
    const encodedLink = encodeURIComponent(link);

    switch (social) {
      case 'line':
        url = `https://social-plugins.line.me/lineit/share?url=${encodedLink}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedLink}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
      <DialogContent className='p-4'>
        <h3 className='mb-2'>แชร์ให้เพื่อน</h3>
        <div className='flex gap-2'>
          <Image
            src='/images/social/line.png'
            alt='line'
            width={50}
            height={50}
            className="rounded-full cursor-pointer"
            onClick={() => handleShare('line')}
          />
          <Image
            src='/images/social/facebook.png'
            alt='facebook'
            width={50}
            height={50}
            className="rounded-full cursor-pointer"
            onClick={() => handleShare('facebook')}
          />
          <Image
            src='/images/social/telegram.png'
            alt='telegram'
            width={50}
            height={50}
            className="rounded-full cursor-pointer"
            onClick={() => handleShare('telegram')}
          />
        </div>
        <div className="grid gap-2 grid-cols-[60%_1fr] text-center bg-gray-300 rounded-xl p-2 mt-2 mb-auto shadow-xs">
          <div className="flex">
            <p className="line-clamp-2 break-words max-w-[200px] text-sm">{link}</p>
          </div>
          <div className="flex">
            <Button
              variant="contained"
              color={color}
              size="small"
              startIcon={<i className="tabler-copy text-[18px]" />}
              className="p-2 whitespace-nowrap my-auto"
              onClick={handleCopy}
            >
              {text}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogShare;
