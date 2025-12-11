// React Imports
import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'


// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import type { DialogProps } from '@mui/material/Dialog'



import GetDateTimeOnly from '@/views/getDateTimeOnly'


// Component Imports

type PrompsDialogMission = {
  data: any;
  mission: any;
}

const DialogMissionWait = ({ data, mission }: PrompsDialogMission) => {

  // States

  const [open, setOpen] = useState<boolean>(false)
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper')


  const descriptionElementRef = useRef<HTMLDivElement>(null);


  const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
    setOpen(true)
    setScroll(scrollType)
  }


  const handleClose = () => setOpen(false)





  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef

      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  return (
    <>




      <div className='relative'>
        <Image
          src={data.thumbnail}
          alt={data.title}
          width={100}
          height={100}
          layout='responsive'
          className='border-[1px] border-gray-200 rounded-md'
        />

        <Button
          onClick={handleClickOpen('paper')}
          variant='contained'
          color='warning'
          size='small'
          className='absolute bottom-[15px] right-[10px]'>
          มีเงื่อนไข
        </Button>
      </div>

      <div className='p-2'>
        <p>{data.title}</p>
        <p className='text-xs mb-2'> สิ้นสุดกิจกรรม : <GetDateTimeOnly isoDate={data.end_date} /></p>

      </div>

      <Dialog open={open} onClose={handleClose} scroll={scroll} aria-labelledby='form-dialog-title' fullWidth>
        <Image src={data.thumbnail} alt={data.title} width={100} height={50} layout='responsive' />

        <DialogContent dividers={scroll === 'paper'}>

          <div className='block gap-4' ref={descriptionElementRef} tabIndex={-1}>

            <h3>{data.title}</h3>
            <p className='mb-4'>{data.detail}</p>

            <h3>ระยะเวลากิจกรรม</h3>
            <p className='text-sm mb-4'><GetDateTimeOnly isoDate={data.start_date} /> - <GetDateTimeOnly isoDate={data.end_date} /></p>

            <h3>รางวัล</h3>
            <p className='mb-4'>{data.point} POINT</p>

            <h3>เงื่อนไข</h3>
            <p className='text-sm'>กรุณาทำภาพกิจ <span className='font-bold underline'>{mission.missionDetails.title}</span> ให้สำเร็จก่อน</p>

          </div>

        </DialogContent>
        <DialogActions className='dialog-actions-dense p-4'>


          <Button color='primary' onClick={handleClose}>ปิดหน้าจอ</Button>
        </DialogActions>
      </Dialog>


    </>
  )
}

export default DialogMissionWait
