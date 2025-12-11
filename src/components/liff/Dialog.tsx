

import Image from 'next/image';

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'




type PropsDialog = {
  title: string;
  open: boolean;
  handleClose: () => void;
}

const Dialogs = ({ title, open, handleClose }: PropsDialog) => {
  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}

      aria-labelledby='alert-dialog-slide-title'
      aria-describedby='alert-dialog-slide-description'
    >
      <DialogContent className=' text-center'>
        <Image src='/images/status/success.png' width={100} height={100} alt={title} />
        <p className='text-xl font-bold'>{title}</p>
      </DialogContent>
    </Dialog>
  )
}

export default Dialogs
