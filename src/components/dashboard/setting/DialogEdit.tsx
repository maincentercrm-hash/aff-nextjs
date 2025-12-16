// React Imports
import React, { useContext, useMemo } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { useQueryClient } from '@tanstack/react-query'

import { ItemsContext } from './MainSetting'
import CustomTextField from '@/@core/components/mui/TextField'

import type { TypeSetting } from '@/types/typeSetting'

import actionUpdate from '@/action/crud/update'


const DialogEdit = () => {

  const queryClient = useQueryClient()


  const { openEdit, setOpenEdit, select, setSelect } = useContext(ItemsContext);

  // Safe values สำหรับ fields ที่อาจเป็น undefined
  const safeSelect = useMemo(() => {
    if (!select) return null

    return {
      ...select,
      title: select.title || '',
      point: select.point || 0
    }
  }, [select])

  const handleClose = () => setOpenEdit(false)

  const handleChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {

    const newName = e.target.value;
    const fieldId = e.target.id;

    setSelect((selectData: TypeSetting) => ({
      ...selectData,
      [fieldId]: newName
    }));

  };




  const handleEdit = async () => {


    await actionUpdate('tbl_setting', select)

    //console.log(res)
    queryClient.invalidateQueries({ queryKey: ['tbl_setting'] })

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
              id='point'
              className='mb-4'
              label='คะแนน'
              type='number'
              placeholder='คะแนน'
              defaultValue={safeSelect.point}
              onChange={handleChangeData}
            />




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
