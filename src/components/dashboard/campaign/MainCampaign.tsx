'use client'

import { createContext, useState } from "react"


import DialogCreate from "./DialogCreate"

import useRead from "@/action/crud/read"
import type { TypeMarketing } from "@/types/typeMarketing"
import DialogDelete from "./DialogDelete"
import DialogState from "./DialogState"
import TableCampaign from "./TableCampaign"


export const ItemsContext = createContext<any>(null);

const MainCampaign = () => {

  const [open, setOpen] = useState<boolean>(false)
  const [openState, setOpenState] = useState<boolean>(false)
  const [openDel, setOpenDel] = useState<boolean>(false)

  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeMarketing>();




  const structure = {
    title: 'เพิ่มข้อมูล',
    table: 'tbl_campaign',
    field: [
      {
        id: 'thumbnail',
        type: 'image',
        label: 'ภาพโฆษณา'
      },
      {
        id: 'target',
        type: 'select',
        value: [
          { id: 'request_tel', label: 'เพิ่มการผูกเบอร์โทรศัพท์' },
          { id: 'ignore_3', label: 'ไม่มีความเลื่อนไหวเกิน 3 วัน' },
          { id: 'ignore_7', label: 'ไม่มีความเลื่อนไหวเกิน 7 วัน' },
          { id: 'ignore_15', label: 'ไม่มีความเลื่อนไหวเกิน 15 วัน' },
          { id: 'ignore_30', label: 'ไม่มีความเลื่อนไหวเกิน 30 วัน' },
          { id: 'request_facebook', label: 'เพิ่มการผูกบัญชี Facebook' },
          { id: 'request_instagram', label: 'เพิ่มการผูกบัญชี Instagram' },
          { id: 'request_telegram', label: 'เพิ่มการผูกบัญชี Telegram' }
        ],
        label: 'เป้าหมาย'
      },
      {
        id: 'title',
        type: 'text',
        label: 'หัวข้อ'
      },
      {
        id: 'detail',
        type: 'multiline',
        label: 'รายละเอียด'
      }
    ]
  }

  const items = useRead('tbl_campaign')

  if (items.status === 'pending') return <span>กำลังโหลดข้อมูล...</span>
  if (!items.data) return <span>ไม่พบข้อมูล</span>

  return (
    <>
      <ItemsContext.Provider
        value={
          {
            open,
            setOpen,
            openState,
            setOpenState,
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
            <DialogState />
          </>

        }

        <TableCampaign items={items.data} />
      </ItemsContext.Provider>
    </>
  )
}

export default MainCampaign
