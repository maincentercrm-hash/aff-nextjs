'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'

// Component Imports
import { useQueryClient } from '@tanstack/react-query'

import FileUpload from './fileUpload'
import actionCreate from '@/action/crud/create'
import { useFormValidation } from '@/validations/useFormValidation'
import { mediasSchema } from '@/validations/schemas'

type propsCreate = {

  structure: any;
}

const DialogCreate = ({ structure }: propsCreate) => {

  const queryClient = useQueryClient()

  // Validation
  const { validate, clearErrors, hasErrors } = useFormValidation(mediasSchema)

  // States
  const [open, setOpen] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const [clearThumbnail, setClearThumbnail] = useState<boolean>(false);

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => {
    setOpen(false)
    setClearThumbnail(false)
    setData(null)
    setErrorMsg('')
    clearErrors()
  }

  const handleFileUpload = (id: string, file: File) => {

    if (file) {
      setData((oldData: any) => ({
        ...oldData,
        [id]: [file]
      }));
      setClearThumbnail(false)
    }

  };




  const handleCreate = async () => {
    // Validate ก่อน submit
    const { isValid } = validate(data || {})
    if (!isValid) {
      setErrorMsg('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด')
      return
    }

    await actionCreate('tbl_medias', data)
    queryClient.invalidateQueries({ queryKey: ['tbl_medias'] })
    setOpen(false)
    clearErrors()
    setErrorMsg('')
  }



  return (
    <>
      <Button variant='contained' size='small' startIcon={<i className='tabler-plus text-[20px]' />} onClick={handleClickOpen}>
        เพิ่มข้อมูล
      </Button>

      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>{structure.title}</DialogTitle>
        <DialogContent>

          {structure.field.map((item: any, index: number) => {
            switch (item.type) {
              case 'image':
                return (
                  <FileUpload
                    key={index}
                    id={item.id}
                    onFileUpload={handleFileUpload}
                    resetFiles={clearThumbnail}
                    label={item.label}
                  />
                );

              case 'file':
                return (
                  <FileUpload
                    key={index}
                    id={item.id}
                    onFileUpload={handleFileUpload}
                    resetFiles={clearThumbnail}
                    label={item.label}
                  />
                );



              // Add more cases if you have more types
              default:
                return null; // or some default component if needed
            }
          })}

          {(hasErrors || errorMsg) && (
            <Alert severity="error" className="mt-4">
              {errorMsg || 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด'}
            </Alert>
          )}

        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button variant='contained' startIcon={<i className='tabler-plus text-[20px]' />} onClick={handleCreate} size='small'>เพิ่มข้อมูล</Button>
          <Button onClick={handleClose} size='small'>ปิดหน้าจอ</Button>
        </DialogActions>
      </Dialog >
    </>
  )
}

export default DialogCreate
