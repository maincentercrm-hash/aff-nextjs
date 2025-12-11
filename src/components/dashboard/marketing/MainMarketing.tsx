'use client'

import { createContext, useState } from "react"

import type { InitMarketing } from "@/types/InitType"
import DialogCreate from "./DialogCreate"
import TableMarketing from "./TableMarketing"
import useRead from "@/action/crud/read"
import type { TypeMarketing } from "@/types/typeMarketing"
import DialogDelete from "./DialogDelete"
import DialogEdit from "./DialogEdit"


export const ItemsContext = createContext<any>(null);

const MainMarketing = () => {

  const [open, setOpen] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openDel, setOpenDel] = useState<boolean>(false)

  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeMarketing>();


  const initDefault: InitMarketing = {
    title: '',
    excerpt: '',
    status: 'publish'
  }

  const structure = {
    title: 'เพิ่มข้อมูล',
    table: 'tbl_marketing',
    field: [
      {
        id: 'thumbnail',
        type: 'image',
        label: 'ภาพปก'
      },
      {
        id: 'title',
        type: 'text',
        label: 'หัวข้อ'
      },
      {
        id: 'excerpt',
        type: 'text',
        label: 'คำโปรย'
      },
      {
        id: 'detail',
        type: 'multiline',
        label: 'รายละเอียด'
      },
      {
        id: 'file_download',
        type: 'file',
        label: 'ไฟล์ดาวน์โหลด'
      },
      {
        id: 'status',
        type: 'select',
        value: [
          'publish',
          'pending'
        ],
        label: 'สถานะ'
      }
    ]
  }

  const items = useRead('tbl_online_marketings')

  if (items.status === 'pending') return <span>กำลังโหลดข้อมูล...</span>
  if (!items.data) return <span>ไม่พบข้อมูล</span>

  return (
    <>
      <ItemsContext.Provider
        value={
          {
            open,
            setOpen,
            openEdit,
            setOpenEdit,
            update,
            setUpdate,
            select,
            setSelect,
            openDel,
            setOpenDel
          }}>

        <DialogCreate initDefault={initDefault} structure={structure} />

        {select &&
          <>
            <DialogDelete />
            <DialogEdit />
          </>

        }

        <TableMarketing items={items.data} />
      </ItemsContext.Provider>
    </>
  )
}

export default MainMarketing
