import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import type { DialogProps } from '@mui/material/Dialog';

import DialogShare from './DialogShare';



interface DialogMarketingProps {
  data: any;
}


const DialogMarketing = ({ data }: DialogMarketingProps) => {




  // States
  const [open, setOpen] = useState<boolean>(false);
  const [share, setShare] = useState<boolean>(false);

  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper');
  const descriptionElementRef = useRef<HTMLDivElement>(null);

  const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => setOpen(false);

  const handleShare = () => {
    setShare(true)
  }

  const handleCloseShare = () => {
    setShare(false)
  }

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;

      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <>

      <Image className='cursor-pointer' src={data.thumbnail} alt={data.title} layout="responsive" width={80} height={80} onClick={handleClickOpen('paper')} />

      <DialogShare data={data} onClose={handleCloseShare} open={share} />

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        scroll={scroll}
        aria-labelledby='form-dialog-title'
        fullWidth
        disableEscapeKeyDown>

        <Image src={data.thumbnail} alt={data.title} layout="responsive" width={100} height={100} />

        <DialogContent dividers={scroll === 'paper'} className='px-4 py-0'>
          <div className='p-2' ref={descriptionElementRef} tabIndex={-1}>
            <h3>{data.title}</h3>
            <p>{data.detail}</p>
          </div>
        </DialogContent>
        <DialogActions className='dialog-actions-dense p-4 justify-center'>
          <Button
            className='text-base'
            variant='contained'
            color='primary'

            startIcon={<i className='tabler-share text-[20px]' />}
            onClick={handleShare}
          >
            แชร์ให้เพื่อน
          </Button>

          <Button color='primary' onClick={handleClose}>
            ปิดหน้าจอ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogMarketing;
