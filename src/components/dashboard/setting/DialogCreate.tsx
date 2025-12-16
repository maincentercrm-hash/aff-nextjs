// components/dashboard/setting/DialogCreate.tsx
'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'

import { useQueryClient } from '@tanstack/react-query'

import CustomTextField from '@/@core/components/mui/TextField'
import actionCreate from '@/action/crud/create'
import { useFormValidation } from '@/validations/useFormValidation'
import { settingSchema } from '@/validations/schemas'

type propsCreate = {
  initDefault: any;
  structure: any;
}

const DialogCreate = ({ initDefault, structure }: propsCreate) => {
  const queryClient = useQueryClient()

  // Validation
  const { validate, getError, clearErrors, hasErrors } = useFormValidation(settingSchema)

  const [open, setOpen] = useState<boolean>(false)
  const [data, setData] = useState(initDefault)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => {
    setOpen(false)
    setData(initDefault)
    clearErrors()
  }

  const handleChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const fieldId = e.target.id;

    setData((oldData: any) => ({
      ...oldData,
      [fieldId]: fieldId === 'point' ? Number(newVal) : newVal
    }));
  };

  const handleCreate = async () => {
    // Validate ก่อน submit
    const { isValid } = validate(data)

    if (!isValid) return

    await actionCreate('tbl_setting', data)
    queryClient.invalidateQueries({ queryKey: ['tbl_setting'] })
    setOpen(false)
    clearErrors()
  }

  return (
    <>
      <Button variant='contained' size='small' className='mt-4' startIcon={<i className='tabler-plus text-[20px]' />} onClick={handleClickOpen}>
        เพิ่มการตั้งค่า
      </Button>

      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>{structure.title}</DialogTitle>
        <DialogContent>
          {structure.field.map((item: any, index: number) => (
            <CustomTextField
              key={index}
              id={item.id}
              fullWidth
              type={item.type}
              label={item.label}
              onChange={handleChangeData}
              className='mb-2'
              error={!!getError(item.id)}
              helperText={getError(item.id)}
            />
          ))}

          {hasErrors && (
            <Alert severity="error" className="mt-4">
              กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง
            </Alert>
          )}
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button variant='contained' startIcon={<i className='tabler-plus text-[20px]' />} onClick={handleCreate} size='small'>เพิ่มข้อมูล</Button>
          <Button onClick={handleClose} size='small'>ปิดหน้าจอ</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DialogCreate
