'use client'

import { createContext, useState } from "react"


import useRead from "@/action/crud/read"
import type { TypeCommunity } from "@/types/typeCommunity"
import DialogDelete from "./DialogDelete"

import TableMedias from "./TableMedias"
import DialogCreate from "./DialogCreate"


export const ItemsContext = createContext<any>(null);

const MainMedias = () => {

  const [open, setOpen] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openDel, setOpenDel] = useState<boolean>(false)

  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeCommunity>();


  const items = useRead('tbl_medias')

  if (items.status === 'pending') return <span>กำลังโหลดข้อมูล...</span>
  if (!items.data) return <span>ไม่พบข้อมูล</span>




  const structure = {
    title: 'เพิ่มข้อมูล',
    table: 'tbl_medias',
    field: [
      {
        id: 'media',
        type: 'file',
        label: 'ไฟล์'
      }
    ]
  }

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

        <DialogCreate structure={structure} />

        {select &&
          <>
            <DialogDelete />

          </>

        }

        <TableMedias items={items.data} />
      </ItemsContext.Provider>
    </>
  )
}

export default MainMedias
