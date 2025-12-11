// React Imports
import React, { useContext, useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

//import DialogContentText from '@mui/material/DialogContentText'



import MenuItem from '@mui/material/MenuItem'

import type { SelectChangeEvent } from '@mui/material/Select';

import { useQueryClient } from '@tanstack/react-query'

import { ItemsContext } from './MainLogsetting'

import CustomTextField from '@/@core/components/mui/TextField'


import type { TypeSettingLog } from '@/types/typeSetting'


import actionUpdateSettingStatus from '@/action/crud/updateSettingStatus'

const DialogCheck = () => {
  const queryClient = useQueryClient();
  const { openCheck, setOpenCheck, select, setSelect } = useContext(ItemsContext);
  const [value, setValue] = useState<string | number>('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleClose = () => setOpenCheck(false);

  const handleChangeStatus = (e: SelectChangeEvent<typeof value> | any) => {
    setValue(e.target.value);
    const newName = e.target.value;
    const fieldId = e.target.name;

    setSelect((selectData: TypeSettingLog) => ({
      ...selectData,
      [fieldId]: newName
    }));
  };

  const handleCheck = async () => {
    try {
      setIsSubmitting(true);
      await actionUpdateSettingStatus('tbl_setting_log', select);
      await queryClient.invalidateQueries({ queryKey: ['tbl_setting_log'] });
      setOpenCheck(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {select && (
        <Dialog
          open={openCheck}
          onClose={handleClose}
          maxWidth='sm'
          fullWidth={true}
          aria-labelledby='alert-dialog-code'
        >
          <DialogTitle id='alert-dialog-code' className='pb-2'>
            ตรวจสอบ : {select.title}
          </DialogTitle>
          <DialogContent>
            <CustomTextField
              select
              fullWidth
              defaultValue=''
              value={select.status}
              label='สถานะ'
              id='status'
              name='status'
              onChange={handleChangeStatus}
              disabled={isSubmitting}
            >
              <MenuItem value='pending' disabled>รอตรวจสอบ</MenuItem>
              <MenuItem value='approved'>ผ่าน</MenuItem>
              <MenuItem value='rejected'>ไม่ผ่าน</MenuItem>
            </CustomTextField>
          </DialogContent>

          <DialogActions className='dialog-actions-dense'>
            <Button
              onClick={handleCheck}
              variant='contained'
              color="success"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการตรวจสอบ'}
            </Button>
            <Button
              onClick={handleClose}
              variant='outlined'
              disabled={isSubmitting}
            >
              ปิดหน้าต่าง
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}



export default DialogCheck
