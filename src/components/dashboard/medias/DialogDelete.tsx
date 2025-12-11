// React Imports
import { useContext } from 'react'

import { useQueryClient } from '@tanstack/react-query'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import type { FirebaseStorage } from 'firebase/storage';
import { ref, deleteObject } from 'firebase/storage';

import { ItemsContext } from './MainMedias'

import { storage } from "@/configs/firebase-config";

import actionDelete from '@/action/crud/delete'


const DialogDelete = () => {

  const queryClient = useQueryClient()

  // States

  const { select, openDel, setOpenDel } = useContext(ItemsContext);

  const handleClose = () => {
    setOpenDel(false)
  }


  async function deleteImage(storage: FirebaseStorage, fullPath: string | undefined) {
    try {
      const storageRef = ref(storage, fullPath);

      await deleteObject(storageRef);

      // console.log(`File at ${fullPath} has been deleted successfully.`);
      await actionDelete('tbl_medias', select._id)
      queryClient.invalidateQueries({ queryKey: ['tbl_medias'] })
      setOpenDel(false)
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  const handleDelete = async () => {
    deleteImage(storage, select.fullPath)
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
          <p className='text-md'>ไฟล์ : {select.name}</p>

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
