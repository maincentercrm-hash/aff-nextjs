'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'

import type { SelectChangeEvent } from '@mui/material/Select'

import { useQueryClient } from '@tanstack/react-query'

import CustomTextField from '@core/components/mui/TextField'
import FileUpload from './fileUpload'
import actionCreate from '@/action/crud/create'
import actionCampaign from '@/action/crud/campaign'
import flexCampaign from '@/action/message/flexCampaign'
import { useFormValidation } from '@/validations/useFormValidation'
import { campaignSchema } from '@/validations/schemas'

type propsCreate = {
  structure: any;
}

const DialogCreate = ({ structure }: propsCreate) => {

  const queryClient = useQueryClient()

  // Validation
  const { validate, getError, clearErrors, hasErrors } = useFormValidation(campaignSchema)

  // States
  const [open, setOpen] = useState<boolean>(false)
  const [data, setData] = useState(null)
  const [target, setTarget] = useState<string>('')
  const [count, setCount] = useState<number | null>(null)

  const [clearThumbnail, setClearThumbnail] = useState<boolean>(false);

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => {
    setOpen(false)
    setClearThumbnail(false)
    setData(null)
    setCount(null)
    setTarget('')
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

  const handleChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {

    const newVal = e.target.value;
    const fieldId = e.target.id;

    setData((oldData: any) => ({
      ...oldData,
      [fieldId]: newVal
    }));
  };

  const handleTarget = async (e: SelectChangeEvent<typeof status> | any) => {

    const newVal = e.target.value;
    const fieldId = e.target.name;

    setTarget(newVal)
    setData((oldData: any) => ({
      ...oldData,
      [fieldId]: newVal
    }));


    const res = await actionCampaign(newVal)


    setData((oldData: any) => ({
      ...oldData,
      volumn: res.length,
      click: 0,
      active: 0,
      users: res
    }));

    setCount(res.length)

  }

  const handleCreate = async () => {
    // Validate ก่อน submit
    const { isValid } = validate(data)

    if (!isValid) return

    const res = await actionCreate('tbl_campaign', data)

    await flexCampaign(data, res.id, res.items.thumbnail)

    queryClient.invalidateQueries({ queryKey: ['tbl_campaign'] })
    setOpen(false)
    clearErrors()
  }



  return (
    <>
      <Button variant='contained' size='small' startIcon={<i className='tabler-plus text-[20px]' />} onClick={handleClickOpen}>
        สร้างแคมเปญ
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

              case 'text':
                return (
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
                );

              case 'number':
                return (
                  <CustomTextField
                    key={index}
                    id={item.id}
                    fullWidth
                    defaultValue={0}
                    type={item.type}
                    label={item.label}
                    onChange={handleChangeData}
                    className='mb-2'
                    error={!!getError(item.id)}
                    helperText={getError(item.id)}
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
                    className='mb-2'
                    error={!!getError(item.id)}
                    helperText={getError(item.id)}
                  />
                );

              case 'select':
                return (

                  <CustomTextField
                    key={index}
                    id={item.id}
                    name={item.id}
                    className='mb-2'
                    select
                    fullWidth
                    defaultValue=''
                    value={target}
                    label={item.label}
                    SelectProps={{
                      onChange: handleTarget
                    }}
                  >

                    {item.value.map((sub: { id: string, label: string }) => (
                      <MenuItem key={sub.id} value={sub.id}>{sub.label}</MenuItem>
                    ))}

                  </CustomTextField>


                );

              // Add more cases if you have more types
              default:
                return null; // or some default component if needed
            }
          })}

          {count &&
            <Alert severity='success'>
              <p>กลุ่มเป้าหมาย จำนวน {count} คน</p>
            </Alert>
          }

          {hasErrors && (
            <Alert severity="error" className="mt-4">
              กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง
            </Alert>
          )}

        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button variant='contained' startIcon={<i className='tabler-plus text-[20px]' />} onClick={handleCreate} size='small'>สร้างแคมเปญ</Button>
          <Button onClick={handleClose} size='small'>ปิดหน้าจอ</Button>
        </DialogActions>
      </Dialog >
    </>
  )
}

export default DialogCreate
