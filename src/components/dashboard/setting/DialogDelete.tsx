// DialogDelete.tsx
import { useContext } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { useQueryClient } from '@tanstack/react-query'

import { ItemsContext } from './MainSetting'
import actionDelete from '@/action/crud/delete'

const DialogDelete = () => {
  const queryClient = useQueryClient()
  const { openDel, setOpenDel, select } = useContext(ItemsContext)

  const handleClose = () => setOpenDel(false)

  const handleDelete = async () => {
    await actionDelete('tbl_setting', select._id)
    queryClient.invalidateQueries({ queryKey: ['tbl_setting'] })
    setOpenDel(false)
  }

  return (
    <Dialog
      open={openDel}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
    >
      <DialogTitle id='alert-dialog-title'>ยืนยันการลบข้อมูล</DialogTitle>
      <DialogContent>
        คุณต้องการลบข้อมูล {`"${select?.title}"`} ใช่หรือไม่?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} color="error" variant="contained">
          ยืนยันการลบ
        </Button>
        <Button onClick={handleClose} variant="outlined">
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogDelete
