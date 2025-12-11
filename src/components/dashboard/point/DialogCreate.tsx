'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import MenuItem from '@mui/material/MenuItem'
import type { SelectChangeEvent } from '@mui/material/Select'

import { useQueryClient } from '@tanstack/react-query'

import CustomTextField from '@core/components/mui/TextField'
import FileUpload from './fileUpload'
import actionCreate from '@/action/crud/create'

type propsCreate = {
  initDefault: any;
  structure: any;
}

const DialogCreate = ({ initDefault, structure }: propsCreate) => {

  const queryClient = useQueryClient()

  // States
  const [open, setOpen] = useState<boolean>(false)
  const [data, setData] = useState(initDefault)

  const [selectValues, setSelectValues] = useState<Record<string, string>>({
    status: initDefault.status,
    type: initDefault.type || 'default'
  })

  const [clearThumbnail, setClearThumbnail] = useState<boolean>(false);

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => {
    setOpen(false)
    setClearThumbnail(false)
    setData(initDefault)
    setSelectValues({
      status: initDefault.status,
      type: initDefault.type || 'default'
    })
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

  const handleChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {

    const newVal = e.target.value;
    const fieldId = e.target.id;

    setData((oldData: any) => ({
      ...oldData,
      [fieldId]: newVal
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string> | any) => {

    const newVal = e.target.value;
    const fieldId = e.target.name;

    setSelectValues((prev) => ({
      ...prev,
      [fieldId]: newVal
    }))
    setData((oldData: any) => ({
      ...oldData,
      [fieldId]: newVal
    }));

  }

  const handleCreate = async () => {

    await actionCreate('tbl_point', data)

    queryClient.invalidateQueries({ queryKey: ['tbl_point'] })
    setOpen(false)
  }



  return (
    <>
      <Button variant='contained' className='mt-4' size='small' startIcon={<i className='tabler-plus text-[20px]' />} onClick={handleClickOpen}>
        เพิ่มข้อมูล
      </Button>

      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>{structure.title}</DialogTitle>
        <DialogContent>

          {structure.field.map((item: any, index: number) => {
            // ตรวจสอบ showWhen condition
            if (item.showWhen) {
              const { field, value } = item.showWhen
              const currentValue = selectValues[field] || data[field]

              if (currentValue !== value) {
                return null // ไม่แสดง field นี้
              }
            }

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
              case 'text':
                return (
                  <CustomTextField
                    key={index}
                    id={item.id}
                    fullWidth
                    type={item.type}
                    label={item.label}
                    onChange={handleChangeData}
                  />
                );

              case 'number':
                return (
                  <CustomTextField
                    key={index}
                    id={item.id}
                    fullWidth
                    type={item.type}
                    label={item.label}
                    onChange={handleChangeData}
                  />
                );

              case 'multiline':
                return (
                  <CustomTextField
                    key={index}
                    id={item.id}
                    multiline
                    rows={4}
                    fullWidth
                    label={item.label}
                    onChange={handleChangeData}
                  />
                );

              case 'select':
                return (

                  <CustomTextField
                    key={index}
                    id={item.id}
                    name={item.id}
                    select
                    fullWidth
                    defaultValue=''
                    value={selectValues[item.id] || ''}
                    label={item.label}
                    SelectProps={{
                      onChange: handleSelectChange
                    }}
                  >

                    {item.value.map((sub: string) => (
                      <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}

                  </CustomTextField>


                );

              // Add more cases if you have more types
              default:
                return null; // or some default component if needed
            }
          })}


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
