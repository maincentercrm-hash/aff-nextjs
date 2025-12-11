// React Imports
import { useContext } from 'react'

import { useQueryClient } from '@tanstack/react-query'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { ItemsContext } from './MainCampaign'

import actionDelete from '@/action/crud/delete'


const DialogDelete = () => {

  const queryClient = useQueryClient()

  // States

  const { select, openDel, setOpenDel } = useContext(ItemsContext);

  const handleClose = () => {
    setOpenDel(false)
  }

  const handleDelete = async () => {
    await actionDelete('tbl_campaign', select._id)

    // console.log(res)

    queryClient.invalidateQueries({ queryKey: ['tbl_campaign'] })
    setOpenDel(false)
  }


  return (
    <>

      <Dialog
        open={openDel}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >

        <DialogContent>
          <h3>ต้องการลบข้อมูล ?</h3>
          <p className='text-md'>หัวข้อ : {select.title}</p>

        </DialogContent>
        <DialogActions className='dialog-actions-dense p-6'>
          <Button onClick={handleDelete} variant='contained' color='error'>ลบข้อมูล</Button>
          <Button onClick={handleClose} variant='outlined'>ปิดหน้าจอ</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DialogDelete
