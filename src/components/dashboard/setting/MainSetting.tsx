//MainSetting.tsx

'use client'

import { createContext, useState } from "react"




import { useQueryClient } from "@tanstack/react-query";

import DialogCreate from "./DialogCreate"

import useRead from "@/action/crud/read"
import type { InitSetting, TypeSetting } from "@/types/typeSetting"
import DialogDelete from "./DialogDelete"
import DialogEdit from "./DialogEdit"
import TableSetting from "./TableSetting"


import actionUpdate from "@/action/crud/update";

export const ItemsContext = createContext<any>(null);

const MainMarketing = () => {

  const queryClient = useQueryClient()

  const [open, setOpen] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openDel, setOpenDel] = useState<boolean>(false)

  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeSetting>();


  const initDefault: InitSetting = {
    title: '',
    point: 0,
    status: true  // เพิ่มค่าเริ่มต้นเป็น true
  }

  const structure = {
    title: 'เพิ่มข้อมูล',
    table: 'tbl_marketing',
    field: [

      {
        id: 'title',
        type: 'text',
        label: 'หัวข้อ'
      },
      {
        id: 'point',
        type: 'number',
        label: 'คะแนน'
      }
    ]
  }



  const items = useRead('tbl_setting')

  if (items.status === 'pending') return <span>กำลังโหลดข้อมูล...</span>
  if (!items.data) return <span>ไม่พบข้อมูล</span>


  // เพิ่มฟังก์ชัน handleStatusChange
  const handleStatusChange = async (row: TypeSetting) => {
    const updatedData = {
      ...row,
      status: !row.status
    };

    await actionUpdate('tbl_setting', updatedData);
    queryClient.invalidateQueries({ queryKey: ['tbl_setting'] });
  };

  return (
    <div>
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
            setOpenDel,
            handleStatusChange  // ส่ง function ผ่าน context
          }}>

        <DialogCreate initDefault={initDefault} structure={structure} />

        {select &&
          <>
            <DialogDelete />
            <DialogEdit />
          </>

        }

        <TableSetting items={items.data} />
      </ItemsContext.Provider>
    </div>
  )
}

export default MainMarketing
