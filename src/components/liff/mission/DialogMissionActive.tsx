import { useRef, useState, useEffect, useMemo } from 'react';

import Image from 'next/image';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import type { DialogProps } from '@mui/material/Dialog';
import LinearProgress from '@mui/material/LinearProgress';
import { useQueryClient } from '@tanstack/react-query';

import GetDateTimeOnly from '@/views/getDateTimeOnly';
import { TimeCounter } from './timeCounter';
import Dialogs from '../Dialog';

import actionUpdate from '@/action/crud/update';
import actionPoint from '@/action/crud/point';
import actionCreate from '@/action/crud/create';

import { useMissionShare } from '@/action/mission/useMissionShare';
import { useMissionDeposit } from '@/action/mission/useMissionDeposit';

// Types
interface MissionCache {
  share: Record<string, { startDate: string; endDate: string; condition: string }>;
  deposit: Record<string, { startDate: string; endDate: string; condition: string }>;
}

type PrompsDialogMission = {
  data: any;
  log: any;
  onExpire: () => void;
  missionCache?: MissionCache;
};

const DialogMissionActive = ({ data, log, onExpire, missionCache }: PrompsDialogMission) => {
  const queryClient = useQueryClient();
  const logId = log._id;



  // Mission details
  const startMission = useMemo(() => new Date(log.createDate), [log.createDate]);
  const endMission = useMemo(() => new Date(data.end_date), [data.end_date]);
  const title = data.title;
  const type = data.type;
  const condition = data.condition;
  const point = data.point;

  // States
  const [sumPercent, setSumPercent] = useState(0);
  const [open, setOpen] = useState<boolean>(false);
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descriptionElementRef = useRef<HTMLDivElement>(null);

  // Debug log for dates with more detailed information


  // Get cached dates if available
  const cachedMission = useMemo(() => {
    if (!missionCache) return null;

    return type === 'share'
      ? missionCache.share[log._id]
      : type === 'deposit'
        ? missionCache.deposit[log._id]
        : null;
  }, [missionCache, type, log._id]);

  // Fetch mission data using custom hooks
  const { data: shareData, isLoading: shareLoading } = useMissionShare(
    log.userId,
    `${process.env.NEXT_PUBLIC_LINE_AT}`,
    startMission.toISOString(),
    endMission.toISOString(),
    {
      enabled: type === 'share',
      staleTime: 30000 // ลดเวลา stale time ลงเพื่อให้อัพเดทข้อมูลบ่อยขึ้น
    }
  );

  const { data: depositData, isLoading: depositLoading } = useMissionDeposit(
    log.userId,
    `${process.env.NEXT_PUBLIC_LINE_AT}`,
    startMission.toISOString(),
    endMission.toISOString(),
    {
      enabled: type === 'deposit'
    }
  );

  useEffect(() => {
    if (type === 'share') {
      const totalPlayers = shareData?.totalPlayers ?? 0;
      const progress = (totalPlayers / Number(condition)) * 100;

      setSumPercent(Math.min(progress, 100));

      if (process.env.NODE_ENV === 'development') {
        console.group('Share Mission Progress');

        /*  console.log({
            totalPlayers,
            condition,
            progress,
            startDate: startMission,
            createDate: log.createDate,
            cached: !!cachedMission,
            debug: shareData?.debug
          });
          */
        console.groupEnd();
      }
    } else if (type === 'deposit') {
      const totalDeposit = depositData?.totalDeposit ?? 0;
      const progress = (totalDeposit / Number(condition)) * 100;

      setSumPercent(Math.min(progress, 100));

      if (process.env.NODE_ENV === 'development') {
        /* console.log('Deposit Progress:', {
           totalDeposit,
           condition,
           progress
         });
         */
      }
    }
  }, [type, shareData, depositData, condition, cachedMission, startMission, log.createDate]);

  // Calculate progress based on mission type with improved logging
  useEffect(() => {
    if (type === 'share' && shareData) {
      const progress = (shareData.totalPlayers / Number(condition)) * 100;

      setSumPercent(Math.min(progress, 100));

      if (process.env.NODE_ENV === 'development') {
        console.group('Share Mission Progress');

        /*   console.log({
             totalPlayers: shareData.totalPlayers,
             condition,
             progress,
             startDate: startMission,
             createDate: log.createDate,
             cached: !!cachedMission,
             debug: shareData.debug
           });
           */
        console.groupEnd();
      }
    } else if (type === 'deposit' && depositData) {
      const progress = (depositData.totalDeposit / Number(condition)) * 100;

      setSumPercent(Math.min(progress, 100));

      if (process.env.NODE_ENV === 'development') {
        /*  console.log('Deposit Progress:', {
            totalDeposit: depositData.totalDeposit,
            condition,
            progress
          });
          */
      }
    }
  }, [type, shareData, depositData, condition, cachedMission, startMission, log.createDate]);

  // Event handlers remain the same...
  const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => setOpen(false);

  const handleCloseDialog = () => {
    setDialogOpen(false);

    if (error) {
      setError(null);
    }
  };

  const dialogExpire = () => {
    onExpire();
  };

  const handleGetPoint = async () => {
    try {
      if (sumPercent < 100) {
        setError('ยังไม่สามารถรับรางวัลได้ เนื่องจากยังทำภารกิจไม่สำเร็จ');
        setDialogOpen(true);

        return;
      }

      // console.log('data', data)
      //console.log('data log', log)

      const missionLog = {
        _id: logId,
        status: 'complete',
        point: point,
        completeDate: new Date().toISOString()
      };

      const clientPoint = {
        userId: log.userId,
        tel: log.tel,
        point: point,
        operation: '+',
      };

      const pointLog = {
        userId: log.userId,
        tel: log.tel,
        point: point,
        operation: '+',
        title: title,
        createDate: new Date().toISOString()
      };

      await actionUpdate('tbl_mission_logs', missionLog);
      await actionPoint('tbl_client_point', clientPoint);
      await actionCreate('tbl_point_logs', pointLog);

      //console.log('tbl_mission_logs', missionLog);
      // console.log('tbl_client_point', clientPoint);
      // console.log('tbl_point_logs', pointLog);

      setDialogOpen(true);

      // Invalidate queries immediately after successful completion
      queryClient.invalidateQueries({ queryKey: ['tbl_mission_logs'] });
      queryClient.invalidateQueries({ queryKey: ['tbl_mission', 'status', 'publish'] });
      queryClient.invalidateQueries({ queryKey: ['tbl_client_point', log.userId] });
      queryClient.invalidateQueries({ queryKey: ['missionShare', log.userId] });

    } catch (error) {
      console.error('Error completing mission:', error);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setDialogOpen(true);
    }
  };

  const getProgressText = () => {
    if (type === 'share') {
      const totalPlayers = shareData?.totalPlayers ?? 0;


      return `จำนวนแชร์: ${totalPlayers} / ${condition} คน`;
    }

    if (type === 'deposit') {
      const totalDeposit = depositData?.totalDeposit ?? 0;


      return `ยอดเติมเงิน: ${totalDeposit.toLocaleString()} / ${Number(condition).toLocaleString()} บาท`;
    }


    return 'กำลังโหลดข้อมูล...';
  };

  // Show loading state while fetching data
  if (shareLoading || depositLoading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <LinearProgress className="w-full" />
      </div>
    );
  }

  // JSX remains mostly the same...
  return (
    <>
      <Dialogs
        open={dialogOpen}
        handleClose={handleCloseDialog}
        title={error ? error : `คุณได้รับ ${point} POINT`}
      />

      <div className='relative'>
        <Image
          src={data.thumbnail}
          alt={data.title}
          width={100}
          height={100}
          layout='responsive'
          className='border-[1px] border-gray-200 rounded-md'
        />

        {sumPercent === 100 ? (
          <Button
            onClick={handleGetPoint}
            variant='contained'
            color='error'
            size='small'
            className='absolute bottom-[15px] right-[10px]'
          >
            กดรับ {point} POINT
          </Button>
        ) : (
          <Button
            onClick={handleClickOpen('paper')}
            variant='contained'
            color='success'
            size='small'
            className='absolute bottom-[15px] right-[10px]'
          >
            รับภารกิจนี้แล้ว
          </Button>
        )}
      </div>

      <div className='p-2'>
        <p>{data.title}</p>
        <p className='text-xs mb-2'>
          สิ้นสุดกิจกรรม : <GetDateTimeOnly isoDate={data.end_date} />
        </p>

        <div className='my-2'>
          <LinearProgress variant='determinate' value={sumPercent || 0} />
        </div>

        <div className='flex justify-between'>
          <TimeCounter
            expire={data.end_date}
            missionId={data._id}
            onExpire={dialogExpire}
            log={log}
          />
          <span className='text-xs'>
            ความคืบหน้า : {(sumPercent || 0).toFixed(2)}%
          </span>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby='form-dialog-title'
        fullWidth
      >
        <Image
          src={data.thumbnail}
          alt={data.title}
          width={100}
          height={50}
          layout='responsive'
        />

        <DialogContent dividers={scroll === 'paper'}>
          <div className='block gap-4' ref={descriptionElementRef} tabIndex={-1}>
            <h3>{data.title}</h3>
            <p className='mb-4'>{data.detail}</p>

            <h3>เริ่มทำภารกิจเมื่อ</h3>
            <p className='text-sm mb-4'>
              <GetDateTimeOnly isoDate={log.createDate} />
            </p>

            <h3>สิ้นสุดภารกิจ</h3>
            <p className='text-sm mb-4'>
              <GetDateTimeOnly isoDate={data.end_date} />
            </p>

            <h3>รางวัล</h3>
            <p className='mb-4'>{point} POINT</p>

            <h3>ความคืบหน้า</h3>
            <p className='text-sm mb-4'>{getProgressText()}</p>
          </div>
        </DialogContent>

        <DialogActions className='dialog-actions-dense p-4'>
          <Button color='primary' onClick={handleClose}>
            ปิดหน้าจอ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogMissionActive;
