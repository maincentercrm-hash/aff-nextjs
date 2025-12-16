'use client'

import { createContext, useState, useMemo } from "react"

import type { InitMission } from "@/types/InitType"
import DialogCreate from "./DialogCreate"

import useRead from "@/action/crud/read"
import type { TypeMarketing } from "@/types/typeMarketing"
import DialogDelete from "./DialogDelete"
import DialogEdit from "./DialogEdit"

import TableMission from "./TableMission"


export const ItemsContext = createContext<any>(null);

const MainMission = () => {

  const [open, setOpen] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openDel, setOpenDel] = useState<boolean>(false)

  const [update, setUpdate] = useState<boolean>(false)
  const [select, setSelect] = useState<TypeMarketing>();


  const initDefault: InitMission = {
    title: '',
    type: 'single',
    status: 'publish'
  }

  const structure = {
    title: 'เพิ่มข้อมูล',
    table: 'tbl_mission',
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
        id: 'detail',
        type: 'multiline',
        label: 'รายละเอียด'
      },

      {
        id: 'point',
        type: 'number',
        label: 'รางวัล Point'
      },

      {
        id: 'start_date',
        type: 'date',
        label: 'วันที่เริ่มต้น'
      },
      {
        id: 'end_date',
        type: 'date',
        label: 'วันที่สิ้นสุด'
      },
      {
        id: 'type',
        type: 'type',
        value: [
          'share',
          'deposit'
        ],
        label: 'ประเภท'
      },

      {
        id: 'condition',
        type: 'number',
        label: 'เงื่อนไข'
      },

      {
        id: 'session',
        type: 'session',
        label: 'ชื่อภารกิจ'
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

  const items = useRead('tbl_mission')

  // ดึง unique sessions และนับจำนวน missions ในแต่ละ session
  const { sessions, sessionCounts } = useMemo(() => {
    if (!items.data) return { sessions: [], sessionCounts: {} }

    const counts: Record<string, number> = {}
    const uniqueSessions: string[] = []

    items.data.forEach((item: any) => {
      if (item.session) {
        if (!counts[item.session]) {
          counts[item.session] = 0
          uniqueSessions.push(item.session)
        }

        counts[item.session]++
      }
    })

    // เรียงตามจำนวน missions (มากไปน้อย)
    uniqueSessions.sort((a, b) => counts[b] - counts[a])

    return { sessions: uniqueSessions, sessionCounts: counts }
  }, [items.data])

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
            setOpenDel,
            sessions,
            sessionCounts
          }}>

        <DialogCreate initDefault={initDefault} structure={structure} />

        {select &&
          <>
            <DialogDelete />
            <DialogEdit />
          </>

        }

        <TableMission items={items.data} />
      </ItemsContext.Provider>
    </>
  )
}

export default MainMission
