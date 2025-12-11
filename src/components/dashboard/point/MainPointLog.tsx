'use client'

import { createContext, useState } from "react"


//import useRead from "@/action/crud/read"
import TablePointLog from "./TablePointLog";
import type { TypePointLog } from "@/types/typePointLog";
import useReadKey from "@/action/crud/readByKey";



export const ItemsContext = createContext<any>(null);

const MainPointLog = () => {
  const [select, setSelect] = useState<TypePointLog>();
  const [update, setUpdate] = useState<boolean>(false);


  const items = useReadKey('tbl_point_logs', 'operation', '-');

  if (items.status === 'pending') return <span>กำลังโหลดข้อมูล...</span>
  if (!items.data) return <span>ไม่พบข้อมูล</span>

  return (
    <ItemsContext.Provider
      value={{
        select,
        setSelect,
        update,
        setUpdate
      }}
    >
      <TablePointLog items={items.data} />
    </ItemsContext.Provider>
  )
}

export default MainPointLog
