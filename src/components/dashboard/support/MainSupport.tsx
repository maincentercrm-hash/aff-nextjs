'use client'

import { createContext, useState } from "react"

import type { InitMarketing } from "@/types/InitType"
import DialogCreate from "./DialogCreate"

import useRead from "@/action/crud/read"
import type { TypeSupport } from "@/types/typeSupport"
import DialogDelete from "./DialogDelete"
import DialogEdit from "./DialogEdit"
import TableSupport from "./TableSupport"



export const ItemsContext = createContext<any>(null);

const MainSupport = () => {

  const [open, setOpen] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openDel, setOpenDel] = useState<boolean>(false)

  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeSupport>();


  const initDefault: InitMarketing = {
    title: '',
    excerpt: '',
    status: 'publish'
  }

  const structure = {
    title: 'เพิ่มข้อมูล',
    table: 'tbl_support',
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
        type: 'editor',
        label: 'รายละเอียด'
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

  const items = useRead('tbl_support')

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



        <TableSupport items={items.data} />
      </ItemsContext.Provider>
    </>
  )
}

export default MainSupport
