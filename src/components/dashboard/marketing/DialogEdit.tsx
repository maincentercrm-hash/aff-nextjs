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

import { ItemsContext } from './MainMarketing'

import CustomTextField from '@/@core/components/mui/TextField'

import FileUpload from './fileUpload'


import type { TypeMarketing } from '@/types/typeMarketing'

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

    setSelect((selectData: TypeMarketing) => ({
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

    setSelect((selectData: TypeMarketing) => ({
      ...selectData,
      [fieldId]: newName
    }));
  };

  const handleEdit = async () => {


    await actionUpdate('tbl_online_marketings', select)

    //console.log(res)
    queryClient.invalidateQueries({ queryKey: ['tbl_online_marketings'] })

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
              id='excerpt'
              className='mb-4'
              label='คำโปรย'
              placeholder='คำโปรย'
              defaultValue={select.excerpt}
              onChange={handleChangeData}
            />

            <CustomTextField
              fullWidth
              id='detail'
              rows={4}
              multiline
              label='รายละเอียด'
              defaultValue={select.detail}
              className='mb-4'
              onChange={handleChangeData}
            />



            <Typography variant="h5" component="h5" className='underline text-sm'>ภาพปก</Typography>

            <div className=" my-4 mx-auto">
              <FileUpload
                id="thumbnail"
                label="รูปภาพ"
                onFileUpload={handleFileUpload}
                resetFiles={clearThumbnail}
                defaultImage={select?.thumbnail} // ส่ง thumbnail URL จาก selected item
              />
            </div>

            <Typography variant="h5" component="h5" className='underline text-sm'>ไฟล์ดาวน์โหลด</Typography>
            <div className=" max-w-[200px] my-4 mx-auto">
              <FileUpload
                id='file_download'
                onFileUpload={handleFileUpload}
                resetFiles={clearThumbnail}
                label='ไฟล์ดาวน์โหลด'
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
