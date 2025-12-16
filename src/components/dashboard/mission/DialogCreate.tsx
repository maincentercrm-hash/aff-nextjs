'use client'

// React Imports
import { useState, useContext } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'

import type { SelectChangeEvent } from '@mui/material/Select'

import { useQueryClient } from '@tanstack/react-query'

import CustomTextField from '@core/components/mui/TextField'
import FileUpload from './fileUpload'
import actionCreate from '@/action/crud/create'
import DateTimePicker from './DateTimePicker'
import { useFormValidation } from '@/validations/useFormValidation'
import { missionSchema } from '@/validations/schemas'
import SessionSelector from './SessionSelector'
import { ItemsContext } from './MainMission'

type propsCreate = {
  initDefault: any;
  structure: any;
}


const DialogCreate = ({ initDefault, structure }: propsCreate) => {

  const queryClient = useQueryClient()

  // Get sessions from context
  const { sessions, sessionCounts } = useContext(ItemsContext)

  // Validation
  const { validate, getError, clearErrors, hasErrors } = useFormValidation(missionSchema)

  // States
  const [open, setOpen] = useState<boolean>(false)
  const [data, setData] = useState(initDefault)
  const [status, setStatus] = useState<string>(initDefault.status)
  const [type, setType] = useState<string>(initDefault.type)
  const [session, setSession] = useState<string>('')

  const [clearThumbnail, setClearThumbnail] = useState<boolean>(false);

  const handleClickOpen = () => {
    // ตั้งค่า start_date และ end_date เริ่มต้นเป็นวันปัจจุบัน
    const now = new Date()

    setData((oldData: any) => ({
      ...oldData,
      start_date: now,
      end_date: now
    }))
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setClearThumbnail(false)
    setData(initDefault)
    setSession('')
    clearErrors()
  }

  const handleSessionChange = (value: string) => {
    setSession(value)
    setData((oldData: any) => ({
      ...oldData,
      session: value
    }))
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

  const handleType = (e: SelectChangeEvent<typeof type> | any) => {

    const newVal = e.target.value;
    const fieldId = e.target.name;

    setType(newVal)
    setData((oldData: any) => ({
      ...oldData,
      [fieldId]: newVal
    }));

  }

  const handleStatus = (e: SelectChangeEvent<typeof status> | any) => {

    const newVal = e.target.value;
    const fieldId = e.target.name;

    setStatus(newVal)
    setData((oldData: any) => ({
      ...oldData,
      [fieldId]: newVal
    }));

  }

  const handleCreate = async () => {
    // Validate ก่อน submit
    const { isValid } = validate(data)

    if (!isValid) return

    await actionCreate('tbl_mission', data)

    queryClient.invalidateQueries({ queryKey: ['tbl_mission'] })
    setOpen(false)
    clearErrors()
  }


  const handleChangeDateTime = (id: string, dateTime: any) => {
    setData((oldData: any) => ({
      ...oldData,
      [id]: dateTime
    }));

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

              case 'date':
                return (

                  <div key={index} className='block mb-2'>
                    <DateTimePicker
                      id={item.id}
                      label={item.label}
                      value={data[item.id] ? new Date(data[item.id]) : new Date()}
                      handleChangeDateTime={handleChangeDateTime}
                    />
                  </div>

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

                  <CustomTextField className='mb-2'
                    key={index}
                    id={item.id}
                    name={item.id}
                    select
                    fullWidth
                    defaultValue=''
                    value={status}
                    label={item.label}
                    SelectProps={{
                      onChange: handleStatus
                    }}

                  >

                    {item.value.map((sub: string) => (
                      <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}

                  </CustomTextField>


                );

              case 'type':
                return (

                  <CustomTextField className='mb-2'
                    key={index}
                    id={item.id}
                    name={item.id}
                    select
                    fullWidth
                    defaultValue=''
                    value={type}
                    label={item.label}
                    SelectProps={{
                      onChange: handleType
                    }}
                  >

                    {item.value.map((sub: string) => (
                      <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}

                  </CustomTextField>


                );

              case 'session':
                return (
                  <SessionSelector
                    key={index}
                    sessions={sessions || []}
                    sessionCounts={sessionCounts || {}}
                    value={session}
                    onChange={handleSessionChange}
                    error={!!getError('session')}
                    helperText={getError('session')}
                  />
                );

              // Add more cases if you have more types
              default:
                return null; // or some default component if needed
            }
          })}

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
      </Dialog >
    </>
  )
}

export default DialogCreate
