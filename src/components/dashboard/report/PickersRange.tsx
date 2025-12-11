// components/PickersRange.tsx
import { forwardRef } from 'react'

import Grid from '@mui/material/Grid'
import type { TextFieldProps } from '@mui/material/TextField'
import { format } from 'date-fns'

import AppReactDatepicker from './AppReactDatepicker'
import CustomTextField from '@core/components/mui/TextField'

type CustomInputProps = TextFieldProps & {
  label: string
  end: Date | number | null | undefined
  start: Date | number | null | undefined
}

interface PickersRangeProps {
  value: [Date | null, Date | null]
  onChange: (dates: [Date | null, Date | null]) => void
}

const formatDate = (date: Date | number | null | undefined) => {
  if (!date) return ''

  return format(date, 'dd/MM/yyyy')
}

const PickersRange = ({ value, onChange }: PickersRangeProps) => {
  const [startDate, endDate] = value;

  const handleOnChange = (dates: [Date | null, Date | null]) => {
    onChange(dates);
  };

  const CustomInput = forwardRef((props: CustomInputProps, ref) => {
    const { label, start, end, ...rest } = props;

    const startDateStr = formatDate(start);
    const endDateStr = end ? ` - ${formatDate(end)}` : '';

    const value = `${startDateStr}${endDateStr}`;

    return <CustomTextField fullWidth inputRef={ref} {...rest} label={label} value={value} />;
  });

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AppReactDatepicker
          selectsRange
          selected={startDate || undefined}
          startDate={startDate || undefined}
          endDate={endDate || undefined}
          onChange={handleOnChange}
          shouldCloseOnSelect={false}
          id='date-range-picker'
          customInput={
            <CustomInput
              label='เลือกช่วงวันที่'
              start={startDate}
              end={endDate}
            />
          }
        />
      </Grid>
    </Grid>
  );
};

export default PickersRange;
