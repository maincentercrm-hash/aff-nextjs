'use client'

import { createContext, useState } from "react"


import useRead from "@/action/crud/read"
import type { TypeSettingLog } from "@/types/typeSetting"

import TableLogSetting from "./TableLogSetting"
import DialogCheck from "./DialogCheck"


export const ItemsContext = createContext<any>(null);

const MainLogSetting = () => {

  const [open, setOpen] = useState<boolean>(false)
  const [openCheck, setOpenCheck] = useState<boolean>(false)


  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeSettingLog>();



  const items = useRead('tbl_setting_log')

  if (items.status === 'pending') return <span>กำลังโหลดข้อมูล...</span>
  if (!items.data) return <span>ไม่พบข้อมูล</span>

  return (
    <div>
      <ItemsContext.Provider
        value={
          {
            open,
            setOpen,
            openCheck,
            setOpenCheck,
            update,
            setUpdate,
            select,
            setSelect,
          }}>


        {select &&
          <>
            <DialogCheck />

          </>

        }

        <TableLogSetting items={items.data} />
      </ItemsContext.Provider>
    </div>
  )
}

export default MainLogSetting
