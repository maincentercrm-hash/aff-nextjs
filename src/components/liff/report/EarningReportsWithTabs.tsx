'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports

import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import { useColorScheme, useTheme } from '@mui/material/styles'

// Third Party Imports
import classnames from 'classnames'
import type { ApexOptions } from 'apexcharts'

// Types Imports
import type { SystemMode } from '@core/types'

// Components Imports

import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { rgbaToHex } from '@/utils/rgbaToHex'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('./AppReactApexCharts'))

type ApexChartSeries = NonNullable<ApexOptions['series']>
type ApexChartSeriesData = Exclude<ApexChartSeries[0], number>

type TabCategory = 'affiliate' | 'profit'

type TabType = {
  type: TabCategory
  label: string
  avatarIcon: string
  series: ApexChartSeries
}

// Vars
const tabData: TabType[] = [
  {
    type: 'affiliate',
    label: 'แนะนำเพื่อน',
    avatarIcon: 'tabler-user-heart',
    series: [{ data: [28, 10, 46, 38, 15, 30, 35, 28, 8] }]
  },
  {
    type: 'profit',
    label: 'รายได้',
    avatarIcon: 'tabler-coin-bitcoin',
    series: [{ data: [35, 25, 15, 40, 42, 25, 48, 8, 30] }]
  }
]

const renderTabs = (value: TabCategory) => {
  return tabData.map((item, index) => (
    <Tab
      key={index}
      value={item.type}
      className='mie-4'
      label={
        <div
          className={classnames(
            'flex flex-col items-center justify-center gap-2 is-[80px] bs-[80px] border rounded-xl',
            item.type === value ? 'border-solid border-[var(--mui-palette-primary-main)]' : 'border-dashed'
          )}
        >
          <CustomAvatar variant='rounded' skin='light-static' size={38} {...(item.type === value && { color: 'primary' })}>
            <i className={classnames('text-[22px]', { 'text-textSecondary': item.type !== value }, item.avatarIcon)} />
          </CustomAvatar>
          <Typography className='text-xs capitalize' color='text.primary'>
            {item.label}
          </Typography>
        </div>
      }
    />
  ))
}

const renderTabPanels = (value: TabCategory, theme: Theme, options: ApexOptions, colors: string[]) => {
  return tabData.map((item, index) => {
    const max = Math.max(...((item.series[0] as ApexChartSeriesData).data as number[]))
    const seriesIndex = ((item.series[0] as ApexChartSeriesData).data as number[]).indexOf(max)

    const finalColors = colors.map((color, i) =>
      seriesIndex === i ? rgbaToHex(`rgb(${theme.palette.primary.mainChannel} / 1)`) : color
    )

    return (
      <TabPanel key={index} value={item.type} className='!p-0'>
        <AppReactApexCharts
          type='bar'
          height={233}
          options={{ ...options, colors: finalColors }}
          series={item.series}
        />
      </TabPanel>
    )
  })
}

const EarningReportsWithTabs = ({ serverMode }: { serverMode: SystemMode }) => {
  // States
  const [value, setValue] = useState<TabCategory>('affiliate')

  // Hooks
  const theme = useTheme()
  const { mode } = useColorScheme()

  // Vars
  const _mode = (mode === 'system' ? serverMode : mode) || serverMode
  const disabledText = rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.4)`)

  const handleChange = (event: SyntheticEvent, newValue: TabCategory) => {
    setValue(newValue)
  }

  const colors = Array(9).fill(rgbaToHex(`rgb(${theme.palette.primary.mainChannel} / 0.16)`))

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        distributed: true,
        columnWidth: '33%',
        borderRadiusApplication: 'end',
        dataLabels: { position: 'top' }
      }
    },
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: {
      offsetY: -11,
      formatter: val => `${val}k`,
      style: {
        fontWeight: 500,
        colors: [rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.9)`)],
        fontSize: theme.typography.body1.fontSize as string
      }
    },
    colors,
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    grid: {
      show: false,
      padding: {
        top: -19,
        left: -4,
        right: 0,
        bottom: -11
      }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { color: rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 0.12)`) },
      categories: ['ม.ค', 'ก.พ', 'มี.ค', 'เม.ย', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'],
      labels: {
        style: {
          colors: disabledText,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -18,
        formatter: val => `฿${val}k`,
        style: {
          colors: disabledText,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    responsive: [
      {
        breakpoint: 1450,
        options: {
          plotOptions: {
            bar: { columnWidth: '45%' }
          }
        }
      },
      {
        breakpoint: 600,
        options: {
          dataLabels: {
            style: {
              fontSize: theme.typography.body2.fontSize as string
            }
          },
          plotOptions: {
            bar: { columnWidth: '58%' }
          }
        }
      },
      {
        breakpoint: 500,
        options: {
          plotOptions: {
            bar: { columnWidth: '70%' }
          }
        }
      }
    ]
  }

  return (

    <div className='px-4'>
      <TabContext value={value}>
        <TabList
          variant='scrollable'
          scrollButtons='auto'
          onChange={handleChange}
          aria-label='earning report tabs'
          className='!border-0 mbe-10'
          sx={{
            '& .MuiTabs-indicator': { display: 'none !important' },
            '& .MuiTab-root': { padding: '0 !important', border: '0 !important' }
          }}
        >
          {renderTabs(value)}

        </TabList>
        {renderTabPanels(value, theme, options, colors)}
      </TabContext>
    </div>

  )
}

export default EarningReportsWithTabs
