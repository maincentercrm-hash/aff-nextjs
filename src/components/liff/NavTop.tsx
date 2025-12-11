import React from 'react'

import Link from 'next/link'

import type { PropsNavTop } from '@/types/liffType'



function NavTop({ title }: PropsNavTop) {

  const url = '/liff/dashboard'

  return (
    <div className='flex relative p-4'>

      <Link
        href={url}
        title={title}
        className='flex'
      >
        <i className='tabler-arrow-left'></i>
      </Link>
      <span
        className='
      absolute
      -translate-x-1/2
      -translate-y-1/2
      top-1/2
      left-1/2
      font-bold
      '
      >{title}

      </span>
    </div>
  )
}

export default NavTop
