'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Component Imports
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from './Recharts'
import type { TooltipProps } from './Recharts'

// Styled Component Imports
const AppRecharts = dynamic(() => import('./AppRecharts'))

function getMonthName(month: number) {
  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];


  return monthNames[month];
}

// ฟังก์ชันแปลงคีย์เป็นภาษาไทย
const thaiKey = (key: string) => {
  switch (key) {
    case 'Users':
      return 'ผู้ใช้ใหม่'
    case 'Tel':
      return 'ผูกเบอร์โทรศัพท์'
    case 'Mission':
      return 'รับภารกิจ'
    case 'Complete':
      return 'ภารกิจสำเร็จ'
    case 'Expire':
      return 'ภารกิจล้มเหลว'
    case 'Point':
      return 'แลก POINT'
    default:
      return key
  }
}

const CustomTooltip = (props: TooltipProps<any, any>) => {
  const { active, payload } = props

  if (active && payload) {
    return (
      <div className='recharts-custom-tooltip'>
        <Typography color='text.primary'>{props.label}</Typography>
        <Divider />
        {payload.map((i: any) => (
          <Box key={i.dataKey} className='flex items-center gap-2.5' sx={{ '& i': { color: i.fill } }}>
            <i className='tabler-circle-filled text-[10px]' />
            <Typography variant='body2'>{`${thaiKey(i.dataKey)} : ${i.payload[i.dataKey]}`}</Typography>
          </Box>
        ))}
      </div>
    )
  }


  return null
}

type PropsChart = {
  itemsUsers: any;
  itemsMission: any;  // เปลี่ยนจาก itemsMission เป็น itemsMission
  itemsPoint: any;
}

const RechartsBarChart = ({ itemsUsers, itemsMission, itemsPoint }: PropsChart) => {
  const theme = useTheme()
  const direction = theme.direction || 'ltr';
  const currentDate = new Date();
  const data: any[] = [];

  // ตรวจสอบว่าข้อมูลที่รับมาเป็น Array
  const users = Array.isArray(itemsUsers) ? itemsUsers : [];
  const missions = Array.isArray(itemsMission) ? itemsMission : [];
  const points = Array.isArray(itemsPoint) ? itemsPoint : [];

  for (let i = 0; i < 14; i++) {
    const date = new Date(currentDate);

    date.setDate(currentDate.getDate() - i);
    const formattedDate = `${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()}`;

    // ใช้ตัวแปรที่ตรวจสอบแล้ว
    const countUsers = users.filter((item: { createDate: string | number | Date }) => {
      const createDate = new Date(item.createDate);


      return createDate.toDateString() === date.toDateString();
    }).length;

    const countTel = users.filter((item: { updateDate: string | number | Date }) => {
      const createDate = new Date(item.updateDate);


      return createDate.toDateString() === date.toDateString();
    }).length;

    const countMission = missions.filter((item: { createDate: string | number | Date }) => {
      const createDate = new Date(item.createDate);


      return createDate.toDateString() === date.toDateString();
    }).length;

    const countComplete = missions.filter((item: { createDate: string | number | Date, status: string }) => {
      const createDate = new Date(item.createDate);


      return createDate.toDateString() === date.toDateString() && item.status === 'complete';
    }).length;

    const countExpire = missions.filter((item: { createDate: string | number | Date, status: string }) => {
      const createDate = new Date(item.createDate);


      return createDate.toDateString() === date.toDateString() && item.status === 'expire';
    }).length;

    const countPoint = points.filter((item: { createDate: string | number | Date, operation: string }) => {
      const createDate = new Date(item.createDate);


      return createDate.toDateString() === date.toDateString() && item.operation === '-';
    }).length;

    data.push({
      name: formattedDate,
      Users: countUsers,
      Tel: countTel,
      Mission: countMission,
      Complete: countComplete,
      Expire: countExpire,
      Point: countPoint
    });
  }

  return (
    <Card>
      <CardHeader
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] }
        }}
      />
      <CardContent>
        <div className='flex flex-wrap mbe-4 gap-6'>
          <Box className='flex items-center gap-1.5' sx={{ '& i': { color: '#826af9' } }}>
            <i className='tabler-circle-filled text-xs' />
            <Typography variant='body2'>ผู้ใช้งานใหม่</Typography>
          </Box>
          <Box className='flex items-center gap-1.5' sx={{ '& i': { color: '#0077ff' } }}>
            <i className='tabler-circle-filled text-xs' />
            <Typography variant='body2'>ผูกเบอร์โทรศัพท์</Typography>
          </Box>
          <Box className='flex items-center gap-1.5' sx={{ '& i': { color: '#ffae00' } }}>
            <i className='tabler-circle-filled text-xs' />
            <Typography variant='body2'>รับภารกิจ</Typography>
          </Box>
          <Box className='flex items-center gap-1.5' sx={{ '& i': { color: '#0ac539' } }}>
            <i className='tabler-circle-filled text-xs' />
            <Typography variant='body2'>ภารกิจสำเร็จ</Typography>
          </Box>
          <Box className='flex items-center gap-1.5' sx={{ '& i': { color: '#ff4646' } }}>
            <i className='tabler-circle-filled text-xs' />
            <Typography variant='body2'>ภารกิจล้มเหลว</Typography>
          </Box>
          <Box className='flex items-center gap-1.5' sx={{ '& i': { color: '#009fa5' } }}>
            <i className='tabler-circle-filled text-xs' />
            <Typography variant='body2'>แลก POINT</Typography>
          </Box>
        </div>
        <AppRecharts>
          <div className='bs-[350px]'>
            <ResponsiveContainer>
              <BarChart
                height={350}
                data={data}
                barSize={15}
                style={{ direction }}
                margin={{ left: -20 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' reversed={direction === 'rtl'} />
                <YAxis orientation={direction === 'rtl' ? 'right' : 'left'} />
                <Tooltip content={CustomTooltip} />
                <Bar dataKey='Users' stackId='a' fill='#826af9' />
                <Bar dataKey='Tel' stackId='a' fill='#0077ff' />
                <Bar dataKey='Mission' stackId='a' fill='#ffae00' />
                <Bar dataKey='Complete' stackId='a' fill='#0ac539' />
                <Bar dataKey='Expire' stackId='a' fill='#ff4646' />
                <Bar dataKey='Point' stackId='a' fill='#009fa5' radius={[15, 15, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AppRecharts>
      </CardContent>
    </Card>
  )
}

export default RechartsBarChart
