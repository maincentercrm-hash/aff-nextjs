'use client'

// React Imports
import { useState } from 'react'

// Next Imports

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'


// Third-party Imports
import classnames from 'classnames'

// Type Imports
import Alert from '@mui/material/Alert'



import UsersLogin from '@/action/users/userLogin'

import type { SystemMode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { useDialogRegister, useLogin, useStoreMsg } from '@/store/useStore'
import DialogRigister from './DialogRigister'
import { useFormValidation } from '@/validations/useFormValidation'
import { loginSchema } from '@/validations/schemas'

// MUI Imports


// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LoginV2 = ({ mode }: { mode: SystemMode }) => {
  // States
  const { onOpen } = useDialogRegister();

  const { setEmail, setPassword, email, password } = useLogin();

  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Validation
  const { validate, getError, hasErrors } = useFormValidation(loginSchema)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )


  const [token, setToken] = useState<string>('')
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)


  const { msg, status, setMsg } = useStoreMsg();


  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    // Validate ก่อน submit
    const { isValid } = validate({ email, password })
    if (!isValid) return

    try {
      // Now you can use email and password for login logic
      const user = { email, password };
      const responseData = await UsersLogin(user);

      if (!responseData.email) {
        setMsg(responseData.message, responseData.type);
      } else {
        setMsg(responseData.message, responseData.type);
        setToken(responseData.token)
      }

    } catch (error) {
      // Handle login error
      setMsg('มีบางอย่างผิดพลาด', 'error');
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`${themeConfig.templateName} SYSTEM`}</Typography>
            <Typography>กรุณาเข้าสู่ระบบเพื่อใช้งานระบบ</Typography>
          </div>
          <form
            noValidate
            autoComplete='off'
            onSubmit={handleLogin}
            className='flex flex-col gap-5'
          >
            <CustomTextField autoFocus fullWidth
              label='อีเมล / ชื่อผู้ใช้'
              placeholder='กรุณากรอกอีเมลหรือชื่อผู้ใช้งาน'
              name='email'
              onChange={(e) => (setEmail(e.target.value))}
              value={email}
              error={!!getError('email')}
              helperText={getError('email')}
            />
            <CustomTextField
              fullWidth
              label='รหัสผ่าน'
              name='password'
              placeholder='············'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              onChange={(e) => (setPassword(e.target.value))}
              value={password}
              error={!!getError('password')}
              helperText={getError('password')}
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
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel control={<Checkbox />} label='จดจำฉันไว้ในระบบ' />
              <Typography className='text-end' color='primary' component={Link}>
                ลืมรหัสผ่าน?
              </Typography>
            </div>

            {msg && (
              <Alert severity={status}>
                {msg}
              </Alert>
            )}

            {token ? (
              <Button fullWidth variant="contained" color="success" type="submit">
                <Link href="/dashboard">เข้าใช้งานระบบ</Link>
              </Button>
            ) : (
              <Button fullWidth variant="contained" type="submit">
                เข้าสู่ระบบ
              </Button>
            )}



            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>ยังไม่มีบัญชีผู้ใช้ ?</Typography>
              <Typography color='primary' onClick={onOpen} className='cursor-pointer'>
                ลงทะเบียนใช้งาน
              </Typography>
            </div>

          </form>

          <DialogRigister />

        </div>
      </div>
    </div>
  )
}

export default LoginV2
