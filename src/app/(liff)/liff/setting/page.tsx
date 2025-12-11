'use client'
import React, { useState, useContext } from 'react'

import Image from 'next/image'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'


import CustomTextField from '@/@core/components/mui/TextField'

import NavTop from '@/components/liff/NavTop'
import LiffBox from '@/components/liff/LiffBox'
import useRead from '@/action/crud/read'
import useReadKey from '@/action/crud/readByKey'
import { LineProfile } from "@/components/liffLogin/VerifyProfile"
import actionCreate from '@/action/crud/create'
import useReadBy from '@/action/crud/readBy'
import GetStatus from '@/views/getStatus'
import { useSiteConfig } from '@/components/contexts/ConfigContext'
import Loading from '@/components/Loading'
import actionUpdate from '@/action/crud/update'

export default function Page() {

  const { config } = useSiteConfig();

  const { userId, userIdLine } = useContext(LineProfile)
  const { data: profileData } = useReadBy('tbl_client', userId)

  const [open, setOpen] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState<any>(null)
  const [url, setUrl] = useState('')

  // ดึงข้อมูลจาก tbl_setting
  const settings = useRead('tbl_setting');

  //console.log('settings', settings)


  // ดึงข้อมูลการส่ง URL ของ user นี้
  const settingLogs = useReadKey('tbl_setting_log', 'userId', userIdLine)

  const [isSubmitting, setIsSubmitting] = useState(false);



  const data = {
    profile: {
      tel: profileData?.tel,
      img: profileData?.pictureUrl
    }
  }

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;

    return url.substring(0, maxLength) + '...';
  };

  const handleOpenDialog = (setting: any) => {
    const logStatus = getSettingStatus(setting._id);

    // ถ้าไม่มี log หรือมี log แต่สถานะเป็น rejected ให้เปิด dialog ได้
    if (!logStatus || logStatus.status === 'rejected') {
      setSelectedSetting(setting);


      // ถ้ามี log และสถานะเป็น rejected ให้ set url เดิม
      if (logStatus?.status === 'rejected') {
        setUrl(logStatus.url);
      }

      setOpen(true);
    }
  }

  const handleClose = () => {
    setOpen(false)
    setUrl('')
    setSelectedSetting(null)
  }



  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const logStatus = getSettingStatus(selectedSetting._id);

      let logData;

      if (logStatus?.status === 'rejected') {
        // ถ้าเป็นการแก้ไข ใช้ข้อมูลเดิมแต่อัพเดท url และ status
        logData = {
          ...logStatus,
          url: url,
          status: 'pending'
        };
        await actionUpdate('tbl_setting_log', logData);
      } else {
        // ถ้าเป็นการสร้างใหม่
        logData = {
          userId: userIdLine,
          tel: profileData.tel,
          settingId: selectedSetting._id,
          title: selectedSetting.title,
          url: url,
          point: selectedSetting.point,
          status: 'pending'
        };
        await actionCreate('tbl_setting_log', logData);
      }

      await settingLogs.refetch();
      handleClose();
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (settings.status === 'pending' || settingLogs.status === 'pending')
    return <Loading />
  if (!settings.data) return <div>ไม่พบข้อมูล</div>

  const getSettingStatus = (settingId: string) => {
    if (!settingLogs.data || !Array.isArray(settingLogs.data)) {
      return null;
    }


    // หา log ล่าสุดของ setting นั้นๆ
    const log = settingLogs.data?.find(
      (log: any) => log.settingId === settingId
    )


    return log;
  }

  // Error states
  if (settings.data.status === false) {

    //console.log('profile', profileData.data.tel)

    return (
      <>
        <NavTop title='SETTING' />

        <LiffBox bg={config?.setting.bg_image}>
          <div className='flex justify-center'>
            <Image
              src={profileData.data.pictureUrl}
              width={100}
              height={100}
              alt={profileData.data.tel}
              className="rounded-full"
            />
          </div>
        </LiffBox>

        <div className="p-4 text-center">
          <span>{'ไม่พบข้อมูลการตั้งค่า'}</span>
        </div>

      </>
    )
  }


  return (
    <>
      <NavTop title='SETTING' />
      <LiffBox bg={config?.setting.bg_image}>
        <div className='flex justify-center'>
          <Image
            src={data.profile.img}
            width={100}
            height={100}
            alt={data.profile.tel}
            className="rounded-full"
          />
        </div>
      </LiffBox>

      <div className='flex justify-between border-b-[1px] border-gray-200 border-solid p-4 text-sm'>
        <p>บัญชีผู้ใช้</p>
        <p className='pr-2'>{data.profile.tel}</p>
      </div>

      {settings.data
        .filter((setting: any) => setting.status === true) // กรองเฉพาะ status true
        .map((setting: any) => {
          const logStatus = getSettingStatus(setting._id)

          return (
            <div
              key={setting._id}
              className={`flex justify-between border-b-[1px] border-gray-200 border-solid p-4 text-sm
              ${(!logStatus || logStatus.status === 'rejected') ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              onClick={() => handleOpenDialog(setting)}
            >
              <div className="flex-1">
                <p>{setting.title}</p>
                {logStatus && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    URL: {truncateUrl(logStatus.url)}
                  </p>
                )}
              </div>
              <div className='flex items-center gap-2 ml-2'>
                {logStatus ? (
                  <>
                    <GetStatus status={logStatus.status} />
                    {logStatus.status === 'rejected' && (
                      <i className='tabler-edit text-orange-500'></i>
                    )}
                  </>
                ) : (
                  <>
                    <p className='my-auto'>{setting.point} Point</p>
                    <i className='tabler-chevron-right'></i>
                  </>
                )}
              </div>
            </div>
          );
        })}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {getSettingStatus(selectedSetting?._id)?.status === 'rejected'
            ? `แก้ไข ${selectedSetting?.title}`
            : selectedSetting?.title
          }
        </DialogTitle>
        <DialogContent>
          <CustomTextField
            autoFocus
            margin="dense"
            id="url"
            label="กรุณากรอกข้อมูล"
            type="text"
            fullWidth
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className='mt-2 text-sm'>Point ที่จะได้รับ: {selectedSetting?.point} Point</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!url.trim() || isSubmitting}

          >
            {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยัน'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
