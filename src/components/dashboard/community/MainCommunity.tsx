'use client'

import { createContext, useState } from "react"

import type { InitMarketing } from "@/types/InitType"
import DialogCreate from "./DialogCreate"

import useRead from "@/action/crud/read"
import type { TypeCommunity } from "@/types/typeCommunity"
import DialogDelete from "./DialogDelete"
import DialogEdit from "./DialogEdit"
import TableCommunity from "./TableCommunity"


export const ItemsContext = createContext<any>(null);

const MainCommunity = () => {

  const [open, setOpen] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openDel, setOpenDel] = useState<boolean>(false)

  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeCommunity>();


  const initDefault: InitMarketing = {
    title: '',
    excerpt: '',
    status: 'publish'
  }

  const structure = {
    title: 'เพิ่มข้อมูล',
    table: 'tbl_community',
    field: [
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
        id: 'url',
        type: 'text',
        label: 'ลิงค์'
      },
      {
        id: 'category',
        type: 'category',
        value: [
          'facebook',
          'line',
          'telegram',
          'other'
        ],
        label: 'หมวดหมู่'
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

  const items = useRead('tbl_community')

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

        <TableCommunity items={items.data} />
      </ItemsContext.Provider>
    </>
  )
}

export default MainCommunity
