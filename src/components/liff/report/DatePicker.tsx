'use client'

// React Imports
import { useState, forwardRef } from 'react'

// MUI Imports
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import { format, addDays } from 'date-fns'

// Component Imports
import TextField from '@mui/material/TextField'

import AppReactDatepicker from './AppReactDatepicker'

//import CustomTextField from '@core/components/mui/TextField'

type CustomInputProps = TextFieldProps & {
  label: string
  end: Date | number
  start: Date | number
}

const DatePicker = () => {
  // States
  const [startDate, setStartDate] = useState<Date | null | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | null | undefined>(addDays(new Date(), 15))

  const handleOnChange = (dates: any) => {
    const [start, end] = dates

    setStartDate(start)
    setEndDate(end)
  }



  const CustomInput = forwardRef((props: CustomInputProps, ref) => {
    const { label, start, end, ...rest } = props

    const startDate = format(start, 'dd/MM/yyyy')
    const endDate = end !== null ? ` - ${format(end, 'dd/MM/yyyy')}` : null

    const value = `${startDate}${endDate !== null ? endDate : ''}`

    //return <CustomTextField className="xxxxxxxxxx" inputProps={{ 'className': 'text-sm border-none w-full' }} fullWidth inputRef={ref} {...rest} label={label} value={value} />
    return (
      <TextField
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              border: 'none',
            },
            "&:hover fieldset": {
              border: 'none',
            },
            "&.Mui-focused fieldset": {
              border: 'none',
              boxShadow: 'none !important',
            },
          },
          "& .MuiOutlinedInput-root.Mui-focused": {
            boxShadow: 'none !important', // This ensures no box-shadow for the focused state
          },
        }}
        fullWidth
        inputProps={{ className: 'text-sm border-none w-full py-1 px-0 cursor-pointer' }}
        inputRef={ref}
        {...rest}
        label={label}
        value={value}
      />
    );

  })

  return (

    <AppReactDatepicker
      selectsRange
      endDate={endDate}
      selected={startDate}
      startDate={startDate}
      id='date-range-picker'
      onChange={handleOnChange}
      shouldCloseOnSelect={false}
      customInput={
        <CustomInput label='' start={startDate as Date | number} end={endDate as Date | number} />
      }
    />



  )
}

export default DatePicker
