'use client'
import React, { useState, useMemo, useContext } from 'react';

import dynamic from 'next/dynamic';

import { Noto_Sans_Thai, Inter } from "next/font/google";

import MenuItem from '@mui/material/MenuItem';

import NavTop from '@/components/liff/NavTop';
import CustomTextField from '@/@core/components/mui/TextField';

import { LineProfile } from '@/components/liffLogin/VerifyProfile';
import Loading from '@/components/Loading';
import useReadBy from '@/action/crud/readBy';
import { useAffiliate } from '@/action/client/useAffiliate';

//import { useTestAff } from '@/action/client/useTestAff';


const noto_sans_thai = Noto_Sans_Thai({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-thai',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-heebo',
})


// Dynamic import for ApexCharts
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type TimeRange = 'Daily' | 'Weekly' | 'Monthly';

export default function ReportPage() {
  // Context และ State
  const { userId, userIdLine } = useContext(LineProfile);
  const [timeRange, setTimeRange] = useState<TimeRange>('Daily');



  const { data: profileData, status: profileStatus } = useReadBy('tbl_client', userId);

  // ใช้ current date ถ้าเป็น production หรือ test date ถ้าเป็น development
  const currentDate = useMemo(() => {
    return process.env.NODE_ENV === 'development'
      ? new Date('2024-10-16')
      : new Date();
  }, []);

  // ใช้ useAffiliate hook
  const {
    isLoading: affiliateLoading,
    error: affiliateError,
    todayCommission,
    totalCommission,
    chartData,
    formatAmount
  } = useAffiliate(userIdLine, currentDate, {
    enabled: Boolean(profileData?.tel)
  });


  //console.log('chartData:', chartData)

  // กรองข้อมูลตาม timeRange
  const filteredChartData = useMemo(() => {
    if (!chartData.categories.length) return {
      categories: [],
      series: [{
        name: 'จำนวนเพื่อน',
        data: [],
        color: '#818CF8'
      }, {
        name: 'รายได้',
        data: [],
        color: '#76f472'
      }]
    };

    const currentDateIndex = 0; // เริ่มจากวันล่าสุด
    let filteredIndexes: number[] = [];

    switch (timeRange) {
      case 'Daily':
        // แสดงเฉพาะวันปัจจุบัน
        filteredIndexes = [currentDateIndex];
        break;
      case 'Weekly':
        // แสดง 7 วันล่าสุด
        filteredIndexes = Array.from({ length: 7 }, (_, i) => i);
        break;
      case 'Monthly':
        // แสดง 30 วันล่าสุด
        filteredIndexes = Array.from({ length: 30 }, (_, i) => i);
        break;
    }

    return {
      categories: filteredIndexes.map(i => chartData.categories[i] || ''),
      series: [
        {
          name: 'จำนวนเพื่อน',
          data: filteredIndexes.map(i => chartData.affiliateData[i] || 0),
          color: '#818CF8'
        },
        {
          name: 'รายได้',
          data: filteredIndexes.map(i => chartData.profitData[i] || 0),
          color: '#76f472'
        }
      ]
    };
  }, [chartData, timeRange]);

  // Chart options
  // Chart options
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: {
        show: false
      },
      fontFamily: `${inter.style.fontFamily}, ${noto_sans_thai.style.fontFamily}`
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      }
    },
    dataLabels: {
      enabled: false,
      style: {
        fontFamily: `${inter.style.fontFamily}, ${noto_sans_thai.style.fontFamily}` // เพิ่ม fontFamily
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      padding: {
        bottom: 10
      }
    },
    xaxis: {
      categories: filteredChartData.categories,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          fontFamily: `${inter.style.fontFamily}, ${noto_sans_thai.style.fontFamily}` // เพิ่ม fontFamily
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val.toFixed(1), // เปลี่ยนจาก toFixed(0) เป็น toFixed(1)
        style: {
          fontFamily: `${inter.style.fontFamily}, ${noto_sans_thai.style.fontFamily}`
        }
      },
      tickAmount: 4, // กำหนดจำนวนเส้นแบ่ง scale
      min: 0,        // กำหนดค่าต่ำสุด
      max: undefined, // ให้คำนวณค่าสูงสุดอัตโนมัติ
      decimalsInFloat: 1 // อนุญาตให้แสดงทศนิยม 1 ตำแหน่ง
    },
    legend: {
      position: 'top' as const,
      fontFamily: `${inter.style.fontFamily}, ${noto_sans_thai.style.fontFamily}` // เพิ่ม fontFamily
    }
  }), [filteredChartData]);

  if (profileStatus === 'pending' || affiliateLoading) {
    return <Loading />;
  }

  if (!profileData?.tel) {
    return <span>กรุณาลงทะเบียนก่อนใช้งาน</span>;
  }

  if (affiliateError) {
    return <span>Error: {affiliateError}</span>;
  }

  return (
    <>
      <NavTop title='REPORT' />



      {/* Title Section */}
      <div className='p-4 border-y-[1px] border-solid border-gray-200'>
        <p>ภาพรวมการสร้างรายได้ผ่านลิ้งค์ Affiliate</p>
      </div>

      {/* Summary Cards */}
      <div className='p-4 grid grid-cols-2 gap-4'>
        <div className='p-2 border-[1px] border-solid border-gray-200 rounded-lg'>
          <p className='text-sm flex'>
            <i className='tabler-currency-baht text-[18px]'></i>
            <span className='my-auto'>รายได้วันนี้</span>
          </p>
          <p className='text-2xl font-bold'>
            {formatAmount(todayCommission).split('.')[0]}
            <span className='text-sm'>.{formatAmount(todayCommission).split('.')[1]}</span>
          </p>
        </div>

        <div className='p-2 border-[1px] border-solid border-gray-200 rounded-lg'>
          <p className='text-sm flex'>
            <i className='tabler-currency-baht text-[18px]'></i>
            <span className='my-auto'>รายได้ทั้งหมด</span>
          </p>
          <p className='text-2xl font-bold'>
            {formatAmount(totalCommission).split('.')[0]}
            <span className='text-sm'>.{formatAmount(totalCommission).split('.')[1]}</span>
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className='p-4 grid grid-cols-[70%_1fr]'>
        <p>จำนวนเพื่อนที่แนะนำ/วัน</p>
        <CustomTextField
          select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          size="small"
          className="text-sm"
          sx={{
            '& .MuiSelect-select': {
              fontSize: '0.875rem',
            }
          }}
        >
          <MenuItem value="Daily">วันนี้</MenuItem>
          <MenuItem value="Weekly">สัปดาห์นี้</MenuItem>
          <MenuItem value="Monthly">เดือนนี้</MenuItem>
        </CustomTextField>
      </div>

      {/* Graph Section */}
      <div className="p-4">
        <ReactApexChart
          options={chartOptions}
          series={filteredChartData.series}
          type="bar"
          height={350}
        />
      </div>


      {/* Summary Table */}
      {filteredChartData.series[0].data.some(value => value > 0) && (
        <div className="px-4 pb-4">
          <div className="w-full border-[1px] border-solid border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-1 text-left text-sm text-gray-600 font-medium">วันที่</th>
                  <th className="px-4 py-1 text-right text-sm text-gray-600 font-medium">จำนวนเพื่อน</th>
                  <th className="px-4 py-1 text-right text-sm text-gray-600 font-medium">รายได้</th>
                </tr>
              </thead>
              <tbody>
                {filteredChartData.categories.map((date, index) => (

                  // แสดงแถวเฉพาะเมื่อมีจำนวนเพื่อน หรือ มีรายได้
                  (filteredChartData.series[0].data[index] > 0 || filteredChartData.series[1].data[index] > 0) && (
                    <tr key={date} className="border-t border-gray-200">
                      <td className="px-4 py-1 text-sm">{date}</td>
                      <td className="px-4 py-1 text-right text-sm">
                        {filteredChartData.series[0].data[index]}
                      </td>
                      <td className="px-4 py-1 text-right text-sm">
                        {formatAmount(filteredChartData.series[1].data[index])}
                      </td>
                    </tr>
                  )
                ))}
                {/* แสดงแถวสรุปเมื่อมีข้อมูล */}
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="px-4 py-1 text-sm font-medium">รวม</td>
                  <td className="px-4 py-1 text-right text-sm font-medium">
                    {filteredChartData.series[0].data.reduce((sum, num) => sum + num, 0)}
                  </td>
                  <td className="px-4 py-1 text-right text-sm font-medium">
                    {formatAmount(
                      filteredChartData.series[1].data.reduce((sum, num) => sum + num, 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </>
  );
}
