// React Imports
import React, { useContext, useState, useMemo } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

//import DialogContentText from '@mui/material/DialogContentText'




import MenuItem from '@mui/material/MenuItem'

import type { SelectChangeEvent } from '@mui/material/Select';

import { useQueryClient } from '@tanstack/react-query'

import { ItemsContext } from './MainCommunity'

import CustomTextField from '@/@core/components/mui/TextField'




import type { TypeCommunity } from '@/types/typeCommunity'

import actionUpdate from '@/action/crud/update'


const DialogEdit = () => {

  const queryClient = useQueryClient()


  const { openEdit, setOpenEdit, select, setSelect } = useContext(ItemsContext);

  const [value, setValue] = useState<string | number>('');

  // Safe values สำหรับ fields ที่อาจเป็น undefined
  const safeSelect = useMemo(() => {
    if (!select) return null
    return {
      ...select,
      title: select.title || '',
      excerpt: select.excerpt || '',
      category: select.category || 'other',
      status: select.status || 'pending'
    }
  }, [select])

  const handleClose = () => setOpenEdit(false)

  const handleChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {

    const newName = e.target.value;
    const fieldId = e.target.id;

    setSelect((selectData: TypeCommunity) => ({
      ...selectData,
      [fieldId]: newName
    }));

  };



  const handleChangeStatus = (e: SelectChangeEvent<typeof value> | any) => {
    setValue(e.target.value);
    const newName = e.target.value;
    const fieldId = e.target.name;

    setSelect((selectData: TypeCommunity) => ({
      ...selectData,
      [fieldId]: newName
    }));
  };

  const handleEdit = async () => {


    await actionUpdate('tbl_community', select)

    //console.log(res)
    queryClient.invalidateQueries({ queryKey: ['tbl_community'] })

    setOpenEdit(false)


  }

  return (
    <>
      {safeSelect &&

        <Dialog
          open={openEdit}
          onClose={handleClose}
          maxWidth='sm'
          fullWidth={true}
          aria-labelledby='alert-dialog-code'
        >
          <DialogTitle id='alert-dialog-code' className='pb-2'>แก้ไข : {safeSelect.title}</DialogTitle>
          <DialogContent>

            <CustomTextField fullWidth
              id='title'
              className='mb-4'
              label='หัวข้อ'
              placeholder='หัวข้อ'
              defaultValue={safeSelect.title}
              onChange={handleChangeData}
            />

            <CustomTextField fullWidth
              id='excerpt'
              className='mb-4'
              label='คำโปรย'
              placeholder='คำโปรย'
              defaultValue={safeSelect.excerpt}
              onChange={handleChangeData}
            />

            <CustomTextField
              select
              fullWidth
              defaultValue='other'
              value={safeSelect.category || 'other'}
              label='หมวดหมู่'
              id='category'
              name='category'
              onChange={handleChangeStatus}
            >

              <MenuItem value='facebook'>facebook</MenuItem>
              <MenuItem value='line'>line</MenuItem>
              <MenuItem value='telegram'>telegram</MenuItem>
              <MenuItem value='other'>other</MenuItem>

            </CustomTextField>

            <CustomTextField
              select
              fullWidth
              defaultValue='pending'
              value={safeSelect.status || 'pending'}
              label='สถานะ'
              id='status'
              name='status'
              onChange={handleChangeStatus}
            >

              <MenuItem value='publish'>เปิดใช้งาน</MenuItem>
              <MenuItem value='pending'>รอตรวจสอบ</MenuItem>

            </CustomTextField>

          </DialogContent>

          <DialogActions className='dialog-actions-dense'>
            <Button onClick={handleEdit} variant='contained' color="success">บันทึกการแก้ไข</Button>
            <Button onClick={handleClose} variant='outlined'>ปิดหน้าต่าง</Button>
          </DialogActions>


        </Dialog>



      }


    </>
  )
}

export default DialogEdit
