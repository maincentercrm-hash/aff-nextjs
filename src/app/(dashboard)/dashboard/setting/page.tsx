'use client'

import { useState } from 'react'

import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'


import MainLogSetting from "@/components/dashboard/setting/MainLogsetting"
import MainSetting from "@/components/dashboard/setting/MainSetting"

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

        <>
          {children}
        </>

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
          aria-label="setting tabs"
        >
          <Tab label="ตั้งค่าการทำงาน" />
          <Tab label="รายการรอตรวจสอบ" />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <MainSetting />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        <MainLogSetting />
      </CustomTabPanel>


    </>
  )
}

export default Page
