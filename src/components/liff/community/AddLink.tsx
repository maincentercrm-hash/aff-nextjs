import React, { useState } from 'react'

import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'


import { useQueryClient } from '@tanstack/react-query'

import CustomTextField from '@/@core/components/mui/TextField'
import actionCreate from '@/action/crud/create'
import Dialogs from '../Dialog'
import type { Config } from '@/types/typeConfig'

const determineCategory = (url: string): string => {
  if (url.includes('facebook')) return 'facebook'
  if (url.includes('line')) return 'line'
  if (url.includes('telegram')) return 'telegram'

  return 'other'
}

type propsAddlink = {
  configs: Config | null;
}


function AddLink({ configs }: propsAddlink) {

  const queryClient = useQueryClient()

  const [link, setLink] = useState('')
  const [isLoading, setIsLoading] = useState(false) // New state for loading
  const [dialogOpen, setDialogOpen] = useState(false) // State for dialog open

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setLink(value);
  }

  const handleAddLink = async () => {
    const trimmedLink = link.trim() // Trim whitespace from the link

    if (!trimmedLink || isLoading) {
      return
    }

    setIsLoading(true) // Set loading state to true


    const category = determineCategory(link)

    const linkData = {
      url: link,
      category: category,
      status: 'pending'
    }


    try {
      await actionCreate('tbl_community', linkData)
      queryClient.invalidateQueries({ queryKey: ['tbl_community'] })
      setLink('')
      setDialogOpen(true) // Show dialog on success
    } catch (error) {
      console.error('Error adding link:', error)
    } finally {
      setIsLoading(false) // Set loading state back to false
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  return (
    <div className=''>
      <h3>เพิ่มช่องทางให้เพื่อนๆ</h3>
      <p>แบ่งปันช่องทางการสร้างรายได้ของคุณ ให้เพื่อนๆ ได้เลย เพียงแปะลิงก์ช่องทางในช่องว่างด้านล่าง</p>


      <div className='grid gap-2 grid-cols-[70%_30%] my-2'>
        <CustomTextField
          id='input-with-icon-adornment'
          label='URL ที่แนะนำ'
          value={link}
          onChange={handleInput}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='tabler-link' />
              </InputAdornment>
            )
          }}
        />

        <Button
          variant='contained'
          size='small'
          className='mt-auto h-[40px]'
          onClick={handleAddLink}
          disabled={isLoading} // Disable button while loading
          style={{
            background: configs?.community.button_save_color || '#d1ff17',
            color: '#000000'
          }}
        >
          {isLoading ? 'ส่ง...' : 'บันทึก'}
        </Button>

      </div>

      <Dialogs open={dialogOpen} handleClose={handleCloseDialog} title='บันทึกสำเร็จ' />
    </div>
  )
}

export default AddLink
