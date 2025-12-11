import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

import CustomTextField from '@/@core/components/mui/TextField'

import UsersRegister from '@/action/users/userRegister'

import { useDialogRegister, useStoreMsg } from '@/store/useStore'

const DialogRigister = () => {

  const { open, onClose, email, password, setEmail, setPassword } = useDialogRegister();
  const { msg, status, setMsg } = useStoreMsg();

  const [isPasswordShown, setIsPasswordShown] = useState(false);



  const handleClickShowPassword = () => {
    setIsPasswordShown((prev) => !prev);
  };


  const handleRegister = async () => {
    try {
      const user = { email, password };  // Ensure this matches your RegisterType definition
      const responseData = await UsersRegister(user);

      setMsg(responseData.message, responseData.type);
    } catch (error) {
      setMsg('มีบางอย่างผิดพลาด', 'error');
    }
  }




  return (
    <Dialog open={open} onClose={onClose} aria-labelledby='form-dialog-title'>
      <DialogTitle id='form-dialog-title'>ลงทะเบียนใช้งาน</DialogTitle>
      <DialogContent className='flex flex-col gap-2'>
        <DialogContentText className='mbe-3'>
          กรุณากรอกอีเมลและรหัสผ่านของคุณ เพื่อทำการลงทะเบียนใช้งาน
        </DialogContentText>


        <CustomTextField autoFocus fullWidth
          label='อีเมล / ชื่อผู้ใช้'
          placeholder='กรุณากรอกอีเมลหรือชื่อผู้ใช้งาน'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <CustomTextField
          fullWidth
          label='รหัสผ่าน'
          placeholder='············'
          id='outlined-adornment-password'
          type={isPasswordShown ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                  <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {msg && (
          <Alert severity={status}>
            {msg}
          </Alert>
        )}

      </DialogContent>
      <DialogActions className='dialog-actions-dense'>

        <Button variant='contained' onClick={handleRegister}>ลงทะเบียน</Button>
        <Button onClick={onClose}>ปิดหน้าต่าง</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogRigister
