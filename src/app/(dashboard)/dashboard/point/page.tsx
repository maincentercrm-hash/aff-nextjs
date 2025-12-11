'use client'

import { useState } from 'react'

import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'

import MainPoint from "@/components/dashboard/point/MainPoint"
import MainPointLog from '@/components/dashboard/point/MainPointLog'


interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <>{children}</>
      )}
    </div>
  )
}

const Page = () => {
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="point tabs"
        >
          <Tab label="จัดการพ้อยต์" />
          <Tab label="ประวัติการแลก" />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <MainPoint />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        <MainPointLog />
      </CustomTabPanel>
    </>
  )
}

export default Page
