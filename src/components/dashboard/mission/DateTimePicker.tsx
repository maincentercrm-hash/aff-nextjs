// React Imports
import { useState } from 'react'


// Third-party Imports
//import { setHours, setMinutes } from 'date-fns'

// Component Imports
import AppReactDatepicker from './AppReactDatepicker'
import CustomTextField from '@core/components/mui/TextField'

interface DateTimePickerProps {
  id: string;
  label: string;
  value: Date;
  handleChangeDateTime: (id: string, dateTime: any,) => void
}

const DateTimePicker = ({ id, label, value, handleChangeDateTime }: DateTimePickerProps) => {
  // States

  const [time, setTime] = useState<Date | null | undefined>(value)

  const handleDateChange = (date: Date) => {
    setTime(date);
    handleChangeDateTime(id, date)

  };



  return (
    <AppReactDatepicker
      showTimeSelect

      selected={time}
      id={id}
      dateFormat='dd/MM/yyyy h:mm aa'
      onChange={handleDateChange}
      customInput={<CustomTextField label={label} fullWidth />}
      className='mb-2'
    />
  )
}

export default DateTimePicker
