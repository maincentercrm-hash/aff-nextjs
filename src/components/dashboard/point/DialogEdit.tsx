// React Imports
import React, { useContext, useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

//import DialogContentText from '@mui/material/DialogContentText'

import Typography from '@mui/material/Typography'


import MenuItem from '@mui/material/MenuItem'

import type { SelectChangeEvent } from '@mui/material/Select';

import { useQueryClient } from '@tanstack/react-query'

import { ItemsContext } from './MainPoint'

import CustomTextField from '@/@core/components/mui/TextField'

import FileUpload from './fileUpload'


import type { TypePoint } from '@/types/typePoint'

import actionUpdate from '@/action/crud/update'


const DialogEdit = () => {

  const queryClient = useQueryClient()


  const { openEdit, setOpenEdit, select, setSelect } = useContext(ItemsContext);

  const [value, setValue] = useState<string | number>('');

  const [clearThumbnail, setClearThumbnail] = useState<boolean>(false);

  const handleClose = () => setOpenEdit(false)

  const handleChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {

    const newName = e.target.value;
    const fieldId = e.target.id;

    setSelect((selectData: TypePoint) => ({
      ...selectData,
      [fieldId]: newName
    }));

  };

  const handleFileUpload = (id: string, file: File) => {

    if (file) {
      setSelect((oldData: any) => ({
        ...oldData,
        [id]: [file]
      }));

      //setClearThumbnail(false)
    }

  };

  const handleChangeStatus = (e: SelectChangeEvent<typeof value> | any) => {
    setValue(e.target.value);
    const newName = e.target.value;
    const fieldId = e.target.name;

    setSelect((selectData: TypePoint) => ({
      ...selectData,
      [fieldId]: newName
    }));
  };

  const handleEdit = async () => {


    await actionUpdate('tbl_point', select)

    //console.log(res)
    queryClient.invalidateQueries({ queryKey: ['tbl_point'] })

    setOpenEdit(false)
    setClearThumbnail(false)

  }

  return (
    <>
      {select &&

        <Dialog
          open={openEdit}
          onClose={handleClose}
          maxWidth='sm'
          fullWidth={true}
          aria-labelledby='alert-dialog-code'
        >
          <DialogTitle id='alert-dialog-code' className='pb-2'>แก้ไข : {select.title}</DialogTitle>
          <DialogContent>

            <CustomTextField fullWidth
              id='title'
              className='mb-4'
              label='หัวข้อ'
              placeholder='หัวข้อ'
              defaultValue={select.title}
              onChange={handleChangeData}
            />

            <CustomTextField fullWidth
              id='point'
              className='mb-4'
              label='พ้อย'
              type='number'
              placeholder='พ้อย'
              defaultValue={select.point}
              onChange={handleChangeData}
            />

            <CustomTextField
              select
              fullWidth
              className='mb-4'
              defaultValue=''
              value={select.type || 'default'}
              label='ประเภทรางวัล'
              id='type'
              name='type'
              onChange={handleChangeStatus}
            >
              <MenuItem value='default'>default</MenuItem>
              <MenuItem value='credit'>credit</MenuItem>
            </CustomTextField>


            <Typography variant="h5" component="h5" className='underline text-sm'>ภาพปก</Typography>

            <div className=" max-w-[200px] my-4 mx-auto">
              <FileUpload
                id='thumbnail'
                onFileUpload={handleFileUpload}
                resetFiles={clearThumbnail}
                label='ภาพปก'
              />
            </div>


            <CustomTextField
              select
              fullWidth
              defaultValue=''
              value={select.status}
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
