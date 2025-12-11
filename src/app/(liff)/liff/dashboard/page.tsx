'use client'
import React, { useContext, useMemo } from 'react'

import LiffBox from '@/components/liff/LiffBox'
import Profile from '@/components/liff/dashboard/Profile'
import Income from '@/components/liff/dashboard/Income'
import LinkAffiliate from '@/components/liff/dashboard/LinkAffiliate'
import LiffBoxRound from '@/components/liff/LiffBoxRound'
import MenuLiff from '@/components/liff/dashboard/MenuLiff'
import { LineProfile } from '@/components/liffLogin/VerifyProfile'

import useReadBy from '@/action/crud/readBy'
import Loading from '@/components/Loading'
import Swiper from '@/components/liff/dashboard/Swiper'
import { useAffiliate } from '@/action/client/useAffiliate'
import affURL from '@/utils/affUrl'
import { useSiteConfig } from '@/components/contexts/ConfigContext'

export default function Page() {
  const { config, menuItems } = useSiteConfig()




  const { userId, userIdLine } = useContext(LineProfile)
  const { data: profileData, status: profileStatus } = useReadBy('tbl_client', userId)

  // ใช้ current date ถ้าเป็น production หรือ test date ถ้าเป็น development
  const currentDate = useMemo(() => {
    return process.env.NODE_ENV === 'development'
      ? new Date('2024-10-16')
      : new Date()
  }, [])

  // เรียก useAffiliate เฉพาะเมื่อมี tel แล้วเท่านั้น
  const {
    todayCommission = 0,
    totalCommission = 0,
    getCommissionBetweenDates = () => 0,
    affiliateCode = '',
    isLoading: affiliateLoading = false,
    error: affiliateError = null,
    debugData = null
  } = useAffiliate(userIdLine, currentDate, {
    enabled: Boolean(profileData?.tel)
  })

  // ดึงข้อมูลรายได้ระหว่างวันที่
  const incomeData = useMemo(() => {
    if (!profileData?.tel) return { today: 0, monthToDate: 0, total: 0 }

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    return {
      today: todayCommission,
      monthToDate: getCommissionBetweenDates(firstDayOfMonth, lastDayOfMonth),
      total: totalCommission
    }
  }, [currentDate, todayCommission, getCommissionBetweenDates, totalCommission, profileData?.tel])

  // Loading state สำหรับ profile
  if (profileStatus === 'pending') return <Loading />
  if (!profileData) return <span>ไม่พบข้อมูล</span>

  // ถ้ายังไม่มีเบอร์โทร แสดงแค่ Profile
  if (!profileData.tel) {
    return <Profile {...profileData} />
  }

  // Loading state สำหรับ affiliate
  if (affiliateLoading) return <Loading />
  if (affiliateError) return <span>Error: {affiliateError}</span>

  // Development logs
  if (process.env.NODE_ENV === 'development' && debugData) {
    /*  console.group('Affiliate Debug Data')
      console.log('Available dates:', debugData.availableDates)
      console.log('Current formatted date:', debugData.currentFormattedDate)
      console.log('Today commission:', incomeData.today)
      console.log('Month to date:', incomeData.monthToDate)
      console.log('Total commission:', incomeData.total)
      */
    console.groupEnd()
  }

  return (
    <>
      <LiffBox bg={config?.dashboard?.section_cover?.bg_image}>
        <Profile {...profileData} />
        <Income
          today={incomeData.monthToDate}
          total={incomeData.total}
        />
        <LinkAffiliate configs={config}
          linkAffiliate={affURL(affiliateCode)}
        />
      </LiffBox>
      <LiffBoxRound>
        <MenuLiff menuItems={menuItems} />
      </LiffBoxRound>
      <Swiper configs={config} />
    </>
  )
}
