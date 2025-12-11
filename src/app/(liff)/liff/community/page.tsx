'use client'
import React, { useState } from 'react'

import MenuItem from '@mui/material/MenuItem'
import Pagination from '@mui/material/Pagination'
import type { SelectChangeEvent } from '@mui/material/Select'

import NavTop from '@/components/liff/NavTop'
import LiffBoxImg from '@/components/liff/LiffBoxImg'
import LiffBoxPadding from '@/components/liff/LiffBoxPadding'
import BoxList from '@/components/liff/community/BoxList'
import CustomTextField from '@/@core/components/mui/TextField'
import AddLink from '@/components/liff/community/AddLink'
import useReadKey from '@/action/crud/readByKey'
import Loading from '@/components/Loading'
import { useSiteConfig } from '@/components/contexts/ConfigContext'

export default function Page() {

  const { config } = useSiteConfig();

  const items = useReadKey('tbl_community', 'status', 'publish')
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('all')

  // Show loading state
  if (items.status === 'pending') return <Loading />

  // console.log('items', items)

  // Handle error cases and empty data
  if (items.data.status === false) {
    return (
      <>
        <NavTop title='COMMUNITY' />
        <LiffBoxImg
          img={config?.community.bg_image || '/images/pages/bg-community.jpg'}
          obj={config?.community.icon_image || '/images/pages/obj-community.png'}
        />
        <div className='grid gap-4 -mt-[250px]'>
          <LiffBoxPadding>
            <AddLink configs={config} />
          </LiffBoxPadding>
          <LiffBoxPadding>
            <div className="p-4 text-center">
              <span>{'ไม่พบข้อมูล'}</span>
            </div>
          </LiffBoxPadding>
        </div>
      </>
    )
  }

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeCategory = (e: SelectChangeEvent<typeof category> | any) => {
    setCategory(e.target.value)
    setPage(1) // Reset to the first page when the category changes
  }

  const ITEMS_PER_PAGE = 5

  const filteredItems = category === 'all'
    ? items.data
    : items.data.filter((item: { category: string }) => item.category === category)

  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const slicedItems = filteredItems.slice(startIndex, endIndex)

  const data = {
    img: '/images/pages/bg-community.jpg',
    obj: '/images/pages/obj-community.png',
    items: slicedItems
  }




  return (
    <>
      <NavTop title='COMMUNITY' />
      <LiffBoxImg img={data.img} obj={data.obj} />

      <div className='grid gap-4 -mt-[250px]'>
        <LiffBoxPadding>
          <AddLink configs={config} />
        </LiffBoxPadding>

        <LiffBoxPadding>
          <div className='flex gap-2'>
            <CustomTextField
              fullWidth
              select
              defaultValue='all'
              value={category || 'all'}
              id='select-without-label'
              onChange={handleChangeCategory}
              inputProps={{
                'aria-label': 'Without label',
                'className': 'border-solid border-gray-600 rounded-lg'
              }}
            >
              <MenuItem value='all'>แสดงทั้งหมด</MenuItem>
              <MenuItem value='facebook'>facebook</MenuItem>
              <MenuItem value='line'>line</MenuItem>
              <MenuItem value='telegram'>telegram</MenuItem>
              <MenuItem value='other'>other</MenuItem>
            </CustomTextField>
          </div>

          {filteredItems.length > 0 ? (
            <>
              <BoxList items={data.items} />
              <Pagination
                count={Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
                page={page}
                shape='rounded'
                color='primary'
                onChange={handleChangePage}
                className='px-4 flex justify-center'
              />
            </>
          ) : (
            <div className="p-4 text-center">
              <span>ไม่พบข้อมูลในหมวดหมู่ที่เลือก</span>
            </div>
          )}
        </LiffBoxPadding>
      </div>
    </>
  )
}
