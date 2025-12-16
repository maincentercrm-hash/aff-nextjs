import Typography from '@mui/material/Typography'

interface FieldErrorProps {
  error?: string
}

/**
 * Component สำหรับแสดง error message ใต้ field
 */
export default function FieldError({ error }: FieldErrorProps) {
  if (!error) return null

  return (
    <Typography
      variant="caption"
      color="error"
      sx={{ mt: 0.5, display: 'block' }}
    >
      {error}
    </Typography>
  )
}
