// React Imports
import React, { useContext } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

//import DialogContentText from '@mui/material/DialogContentText'


import Avatar from '@mui/material/Avatar'

import { ItemsContext } from './MainCampaign'


const DialogState = () => {


  const { openState, setOpenState, select } = useContext(ItemsContext);


  const handleClose = () => setOpenState(false)


  return (
    <>
      {select &&

        <Dialog
          open={openState}
          onClose={handleClose}
          maxWidth='sm'
          fullWidth={true}
          aria-labelledby='alert-dialog-code'
        >
          <DialogTitle id='alert-dialog-code' className='pb-2'>แคมเปญ : {select.title}</DialogTitle>
          <DialogContent>

            <div className='grid grid-cols-[70%_15%_1fr] gap-2 mb-2'>
              <p>โปรไฟล์</p>
              <p>เข้าชม / ครั้ง</p>
              <p className='text-right'>สถานะ</p>
            </div>

            {select.users.map((item: any, index: any) => (
              <div key={index} className='grid grid-cols-[70%_15%_1fr] gap-2 mb-2' >
                <div className='flex gap-2'>
                  <Avatar src={item.pictureUrl} alt={item.displayName} />
                  <div className='block leading-none my-auto'>
                    <p>{item.displayName}</p>
                    <span className='text-xs'> userId : {item.userId}</span>
                  </div>
                </div>
                <p className='text-center my-auto'>{item.click | 0}</p>
                <p className='text-right my-auto'>
                  {item.active === 1 ? 'สำเร็จ' : 'รอ'}
                </p>
              </div>
            ))

            }



          </DialogContent>

          <DialogActions className='dialog-actions-dense'>

            <Button onClick={handleClose} variant='outlined'>ปิดหน้าต่าง</Button>
          </DialogActions>


        </Dialog>



      }


    </>
  )
}

export default DialogState
