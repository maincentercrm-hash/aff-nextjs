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

import { ItemsContext } from './MainMission'

import CustomTextField from '@/@core/components/mui/TextField'

import FileUpload from './fileUpload'


import type { TypeMission } from '@/types/typeMission'

import actionUpdate from '@/action/crud/update'
import DateTimePicker from './DateTimePicker'


const DialogEdit = () => {

  const queryClient = useQueryClient()


  const { openEdit, setOpenEdit, select, setSelect } = useContext(ItemsContext);

  const [value, setValue] = useState<string | number>('');

  const [clearThumbnail, setClearThumbnail] = useState<boolean>(false);



  const handleClose = () => setOpenEdit(false)

  const handleChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {

    const newName = e.target.value;
    const fieldId = e.target.id;

    setSelect((selectData: TypeMission) => ({
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

    setSelect((selectData: TypeMission) => ({
      ...selectData,
      [fieldId]: newName
    }));
  };

  const handleChangeDateTime = (id: string, dateTime: any) => {

    setSelect((selectData: TypeMission) => ({
      ...selectData,
      [id]: dateTime
    }));

  }

  const handleEdit = async () => {


    await actionUpdate('tbl_mission', select)

    //console.log(res)
    queryClient.invalidateQueries({ queryKey: ['tbl_mission'] })

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
              className='mb-2'
              label='หัวข้อ'
              placeholder='หัวข้อ'
              defaultValue={select.title}
              onChange={handleChangeData}
            />

            <CustomTextField
              fullWidth
              id='detail'
              rows={4}
              multiline
              label='รายละเอียด'
              defaultValue={select.detail}
              className='mb-2'
              onChange={handleChangeData}
            />

            <CustomTextField fullWidth
              id='point'
              type='number'
              className='mb-2'
              label='รางวัล POINT'
              placeholder='รางวัล POINT'
              defaultValue={select.point}
              onChange={handleChangeData}
            />


            <DateTimePicker id='start_date' label='วันที่เริ่มต้น' handleChangeDateTime={handleChangeDateTime} value={new Date(select.start_date)} />
            <DateTimePicker id='end_date' label='วันที่สิ้นสุด' handleChangeDateTime={handleChangeDateTime} value={new Date(select.end_date)} />




            <CustomTextField
              select
              fullWidth
              defaultValue=''
              value={select.type}
              label='ประเภท'
              id='type'
              name='type'
              className='mb-2'
              onChange={handleChangeStatus}
            >

              <MenuItem value='share'>share</MenuItem>
              <MenuItem value='deposit'>deposit</MenuItem>

            </CustomTextField>

            <CustomTextField fullWidth
              id='condition'
              type='number'
              className=''
              label='เงื่อนไข'
              placeholder='เงื่อนไข'
              defaultValue={select.condition}
              onChange={handleChangeData}
            />


            <CustomTextField fullWidth
              id='session'
              className='my-4'
              label='ชื่อภารกิจ'
              placeholder='ชื่อภารกิจ'
              defaultValue={select.session}
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
