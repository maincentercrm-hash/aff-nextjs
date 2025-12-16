// React Imports
import React, { useContext, useState, useMemo } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

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
import SessionSelector from './SessionSelector'

// Helper function สำหรับ parse date อย่างปลอดภัย
const safeParseDate = (dateValue: any): Date => {
  if (!dateValue) return new Date()
  const parsed = new Date(dateValue)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

const DialogEdit = () => {

  const queryClient = useQueryClient()

  const { openEdit, setOpenEdit, select, setSelect, sessions, sessionCounts } = useContext(ItemsContext);

  const [value, setValue] = useState<string | number>('');

  const [clearThumbnail, setClearThumbnail] = useState<boolean>(false);

  // Safe values สำหรับ fields ที่อาจเป็น undefined
  const safeSelect = useMemo(() => {
    if (!select) return null
    return {
      ...select,
      title: select.title || '',
      detail: select.detail || '',
      point: select.point || 0,
      start_date: select.start_date || new Date().toISOString(),
      end_date: select.end_date || new Date().toISOString(),
      type: select.type || 'share',
      condition: select.condition || '',
      session: select.session || '',
      status: select.status || 'pending',
      thumbnail: select.thumbnail || ''
    }
  }, [select])



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

  const handleSessionChange = (value: string) => {
    setSelect((selectData: TypeMission) => ({
      ...selectData,
      session: value
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
              className='mb-2'
              label='หัวข้อ'
              placeholder='หัวข้อ'
              defaultValue={safeSelect.title}
              onChange={handleChangeData}
            />

            <CustomTextField
              fullWidth
              id='detail'
              rows={4}
              multiline
              label='รายละเอียด'
              defaultValue={safeSelect.detail}
              className='mb-2'
              onChange={handleChangeData}
            />

            <CustomTextField fullWidth
              id='point'
              type='number'
              className='mb-2'
              label='รางวัล POINT'
              placeholder='รางวัล POINT'
              defaultValue={safeSelect.point}
              onChange={handleChangeData}
            />

            <DateTimePicker id='start_date' label='วันที่เริ่มต้น' handleChangeDateTime={handleChangeDateTime} value={safeParseDate(safeSelect.start_date)} />
            <DateTimePicker id='end_date' label='วันที่สิ้นสุด' handleChangeDateTime={handleChangeDateTime} value={safeParseDate(safeSelect.end_date)} />

            <CustomTextField
              select
              fullWidth
              defaultValue='share'
              value={safeSelect.type || 'share'}
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
              defaultValue={safeSelect.condition}
              onChange={handleChangeData}
            />

            <SessionSelector
              sessions={sessions || []}
              sessionCounts={sessionCounts || {}}
              value={safeSelect.session}
              onChange={handleSessionChange}
            />

            <Typography variant="h5" component="h5" className='underline text-sm'>ภาพปก</Typography>
            <div className=" my-4 mx-auto">
              <FileUpload
                id="thumbnail"
                label="รูปภาพ"
                onFileUpload={handleFileUpload}
                resetFiles={clearThumbnail}
                defaultImage={safeSelect.thumbnail}
              />
            </div>

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
