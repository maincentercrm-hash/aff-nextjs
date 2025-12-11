'use client'

import { createContext, useState } from "react"

import type { InitPoint } from "@/types/InitType"
import DialogCreate from "./DialogCreate"

import useRead from "@/action/crud/read"
import type { TypeMarketing } from "@/types/typeMarketing"
import DialogDelete from "./DialogDelete"
import DialogEdit from "./DialogEdit"
import TablePoint from "./TablePoint"


export const ItemsContext = createContext<any>(null);

const MainPoint = () => {

  const [open, setOpen] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openDel, setOpenDel] = useState<boolean>(false)

  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeMarketing>();


  const initDefault: InitPoint = {
    title: '',
    type: 'default',
    status: 'publish'
  }

  const structure = {
    title: 'เพิ่มข้อมูล',
    table: 'tbl_point',
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
        id: 'point',
        type: 'number',
        label: 'พ้อย'
      },
      {
        id: 'type',
        type: 'select',
        value: [
          'default',
          'credit'
        ],
        label: 'ประเภทรางวัล'
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

  const items = useRead('tbl_point')

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

        <TablePoint items={items.data} />
      </ItemsContext.Provider>
    </>
  )
}

export default MainPoint
