import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

// MUI Imports
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import type { DialogProps } from '@mui/material/Dialog';
import { useQueryClient } from '@tanstack/react-query';

import Dialogs from '../Dialog';
import actionPoint from '@/action/crud/point';
import actionCreate from '@/action/crud/create';
import flexMessage from '@/action/message/flexMessage';


// Component Imports

type PrompsDialogReward = {
  data: any;
  currentPoint: number;
  tel: string;
  userId: string;
};

/**
 * ส่งข้อมูลการแลกรางวัล credit ไปยัง External API
 */
async function sendCreditClaimToExternalAPI(params: {
  log_id: string;
  user_id: string;
  tel: string;
  reward_title: string;
  reward_amount: number;
  point_used: number;
}) {
  try {
    const response = await fetch('/api/claim-credit-reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to send credit claim to external API:', result);

      return { success: false, error: result };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending credit claim:', error);

    return { success: false, error };
  }
}

const DialogReward = ({ data, currentPoint, tel, userId }: PrompsDialogReward) => {
  const queryClient = useQueryClient();


  // States
  const [open, setOpen] = useState<boolean>(false);
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper');
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog open
  const [isRedeeming, setIsRedeeming] = useState(false); // State for preventing multiple clicks

  const descriptionElementRef = useRef<HTMLDivElement>(null);

  const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => setOpen(false);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleRedeem = async () => {
    setIsRedeeming(true);

    // ตรวจสอบว่าเป็น credit type หรือไม่
    const isCredit = data.type === 'credit';

    const clientPoint = {
      userId: userId,
      tel: tel,
      point: data.point,
      operation: '-',
    };

    const pointLog = {
      userId: userId,
      tel: tel,
      point: data.point,
      operation: '-',
      title: data.title,
      type: data.type || 'default',  // เพิ่ม type ของรางวัล
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
      status: 'pending'
    };

    const messageData = {
      userId: userId,
      tel: tel,
      point: data.point,
      title: data.title,
      thumbnail: data.thumbnail
    };

    try {
      // Step 1: หัก Points
      await actionPoint('tbl_client_point', clientPoint);

      // Step 2: สร้าง Log
      const logResult = await actionCreate('tbl_point_logs', pointLog);

      // Step 3: ส่ง LINE Notification
      await flexMessage(userId, messageData);

      // Step 4: ถ้าเป็น credit type → ส่งไป External API
      if (isCredit && logResult?.id) {
        await sendCreditClaimToExternalAPI({
          log_id: logResult.id,
          user_id: userId,
          tel: tel,
          reward_title: data.title,
          reward_amount: data.point, // จำนวนเครดิตที่จะได้รับ
          point_used: data.point
        });
      }

      setOpen(false);
      setDialogOpen(true);

      // อัพเดท cache
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tbl_client_point', tel] });
        queryClient.invalidateQueries({ queryKey: ['tbl_point', 'status', 'publish'] });
        setDialogOpen(false);
      }, 3000);

    } catch (error) {
      console.error('Error Redeeming Points:', error);

      // อาจจะเพิ่มการแจ้งเตือน error ให้ user ทราบ
    } finally {
      setIsRedeeming(false);
    }
  };

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
      <Dialogs open={dialogOpen} handleClose={handleCloseDialog} title='แลก Point สำเร็จ !!!' />

      <i className="tabler-shopping-cart m-auto cursor-pointer" onClick={handleClickOpen('paper')}></i>

      <Dialog open={open} onClose={handleClose} scroll={scroll} aria-labelledby='form-dialog-title'>
        <DialogContent className=' text-center'>
          <Image src='/images/status/question.png' width={100} height={100} alt='ยืนยันการแลก Point' />

          <div className='block gap-4' ref={descriptionElementRef} tabIndex={-1}>
            <h3>ยืนยันการแลก Point</h3>
            <p className='text-sm'>{data.title} | {data.point} P</p>
          </div>
        </DialogContent>

        {currentPoint < data.point ? (
          <div className='grid grid-cols-1 gap-2 p-4 pt-0'>
            <Button variant='contained' color='error' fullWidth onClick={handleClose}>POINT ไม่เพียงพอ</Button>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-2 p-4 pt-0'>
            <Button
              variant='contained'
              color='success'
              fullWidth
              onClick={handleRedeem}
              disabled={isRedeeming} // Disable the button while redeeming
            >
              {isRedeeming ? 'ดำเนินการ...' : 'ตกลง'}
            </Button>
            <Button variant='contained' color='error' fullWidth onClick={handleClose}>ยกเลิก</Button>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default DialogReward;
