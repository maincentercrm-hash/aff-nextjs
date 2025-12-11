'use client'
import React, { useState } from 'react'

import Image from 'next/image'

import Pagination from '@mui/material/Pagination'

import NavTop from '@/components/liff/NavTop'
import LiffBox from '@/components/liff/LiffBox'
import DialogSupport from '@/components/liff/support/DialogSupport'
import useReadKey from '@/action/crud/readByKey'
import Loading from '@/components/Loading'
import { useSiteConfig } from '@/components/contexts/ConfigContext'

export default function Page() {
  const { config } = useSiteConfig();

  const items = useReadKey('tbl_support', 'status', 'publish')
  const [page, setPage] = useState(1)

  if (items.status === 'pending') return <Loading />


  const inits = {
    img: config?.support.bg_image || '/images/mockup/bg.jpg',
    init: {
      title: 'แนะนำการใช้งาน',
      excerpt: 'สอบถามเพิ่มเติม แอดไลน์ @lottwin88',
      aligns: 'left'
    }
  }

  if (items.data.status === false) {
    return (
      <>
        <NavTop title='SUPPORT' />
        <LiffBox bg={inits.img}>
          <div className={`text-left pb-16`}>
            <h1 className="text-2xl font-bold">{inits.init.title}</h1>
            <p className="text-sm">{inits.init.excerpt}</p>
          </div>
        </LiffBox>

        <div className="p-4 text-center">
          <span>{'ไม่พบข้อมูล'}</span>
        </div>
      </>
    )
  }


  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage)
  }

  const ITEMS_PER_PAGE = 2
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const slicedItems = items.data.data.slice(startIndex, endIndex)




  const data = {
    img: config?.support.bg_image || '/images/mockup/bg.jpg',
    init: {
      title: 'แนะนำการใช้งาน',
      excerpt: 'สอบถามเพิ่มเติม แอดไลน์ @lottwin88',
      aligns: 'left'
    },
    items: slicedItems
  }



  return (
    <>
      <NavTop title='SUPPORT' />
      <LiffBox>
        <div className={`text-left pb-16`}>
          <h1 className="text-2xl font-bold">{data.init.title}</h1>
          <p className="text-sm">{data.init.excerpt}</p>
        </div>
      </LiffBox>

      <div className="grid gap-4 -mt-14">
        {data.items.map((item: any, index: number) => (
          <div key={index} className="block my-auto min-h-auto h-full px-6 relative">
            <div className={`grid bg-white shadow-xl gap-4 p-4 rounded-lg grid-cols-1`}>
              <div className="grid grid-cols-[30%_1fr] gap-2">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  width={100}
                  height={100}
                  layout="responsive"
                  className="border-[1px] border-gray-200 rounded-md"
                />
                <div className="">
                  <p className="text-lg font-bold">{item.title}</p>
                  <p className="text-xs">{item.excerpt}</p>
                  <DialogSupport data={item} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        count={Math.ceil(items.data.data.length / ITEMS_PER_PAGE)}
        page={page}
        shape='rounded'
        color='primary'
        onChange={handleChangePage}
        className='px-4 mt-4 mb-8 flex justify-center'
      />
    </>
  )
}
