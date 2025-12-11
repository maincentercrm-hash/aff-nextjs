'use client'

import { createContext, useState } from "react"


import useRead from "@/action/crud/read"
import type { TypeCommunity } from "@/types/typeCommunity"
import DialogDelete from "./DialogDelete"

import TableClient from "./TableClient"


export const ItemsContext = createContext<any>(null);

const MainClient = () => {

  const [open, setOpen] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openDel, setOpenDel] = useState<boolean>(false)

  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeCommunity>();


  const items = useRead('tbl_client')

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



        {select &&
          <>
            <DialogDelete />

          </>

        }

        <TableClient items={items.data} />
      </ItemsContext.Provider>
    </>
  )
}

export default MainClient
