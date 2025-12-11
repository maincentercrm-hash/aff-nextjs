'use client';
import React, { useContext, useState, useMemo } from 'react';

import Pagination from '@mui/material/Pagination';

import NavTop from '@/components/liff/NavTop';
import useReadKey from '@/action/crud/readByKey';
import Loading from '@/components/Loading';
import DialogMission from '@/components/liff/mission/DialogMission';
import { LineProfile } from '@/components/liffLogin/VerifyProfile';
import useReadBy from '@/action/crud/readBy';
import DialogMissionActive from '@/components/liff/mission/DialogMissionActive';
import DialogMissionWait from '@/components/liff/mission/DialogMissionWait';

export default function Page() {
  const { userId } = useContext(LineProfile);

  // Base queries
  const items = useReadKey('tbl_mission', 'status', 'publish');
  const profile = useReadBy('tbl_client', userId);
  const missionLog = useReadKey('tbl_mission_logs', 'tel', profile.data?.tel ?? '');

  const [page, setPage] = useState(1);

  //console.log('items', items.data)
  //console.log('missionLog', missionLog.data)

  const sortedItems = useMemo(() => {
    // ถ้าไม่มี items.data ให้ return [] เลย
    if (!Array.isArray(items.data)) return [];

    // ถ้าไม่มี missionLog.data ให้ return items.data ทั้งหมด
    if (!Array.isArray(missionLog.data)) return [...items.data];

    return [...items.data]
      .filter(item => {
        const isCompleted = missionLog.data.some(
          (log: any) =>
            log.mission_id === item._id &&
            (log.status === 'success' || log.status === 'complete')
        );


        return !isCompleted;
      })
      .sort((a, b) => {
        const aIsActive = missionLog.data.some(
          (log: any) => log.mission_id === a._id && log.status === 'active'
        );

        const bIsActive = missionLog.data.some(
          (log: any) => log.mission_id === b._id && log.status === 'active'
        );

        if (aIsActive && !bIsActive) return -1;
        if (!aIsActive && bIsActive) return 1;

        return 0;
      });
  }, [items.data, missionLog.data]);



  // เพิ่ม mission cache
  const missionCache = useMemo(() => {
    if (!Array.isArray(missionLog.data)) return {
      share: {} as Record<string, { startDate: string; endDate: string; condition: string }>,
      deposit: {} as Record<string, { startDate: string; endDate: string; condition: string }>
    };

    const shareCache: Record<string, { startDate: string; endDate: string; condition: string }> = {};
    const depositCache: Record<string, { startDate: string; endDate: string; condition: string }> = {};

    missionLog.data.forEach(mission => {
      if (mission.missionDetails.type === 'share') {
        shareCache[mission._id] = {
          startDate: mission.createDate,  // ใช้ createDate แทน start_date
          endDate: mission.missionDetails.end_date,
          condition: mission.missionDetails.condition
        };
      } else if (mission.missionDetails.type === 'deposit') {
        depositCache[mission._id] = {
          startDate: mission.createDate,  // ใช้ createDate แทน start_date
          endDate: mission.missionDetails.end_date,
          condition: mission.missionDetails.condition
        };
      }
    });

    return { share: shareCache, deposit: depositCache };
  }, [missionLog.data]);

  // Loading states
  if (items.status === 'pending') return <Loading />;
  if (!items.data) return <span>ไม่พบข้อมูล</span>;

  if (profile.status === 'pending') return <Loading />;
  if (!profile.data) return <span>ไม่พบข้อมูล</span>;


  //console.log('sortedItems', sortedItems)

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleExpire = () => {
    setPage(1);
  };




  // แก้ไขส่วนที่ใช้แสดงผล
  const ITEMS_PER_PAGE = 4;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // เปลี่ยนจาก items.data เป็น sortedItems
  const slicedItems = sortedItems.slice(startIndex, endIndex);

  // Debug log
  //console.log('Mission Cache:', missionCache);
  //console.log('Mission Log Data:', missionLog.data);

  return (
    <>
      <NavTop title='MISSION' />
      <div className='p-4'>
        <p>กิจกรรม affiliate</p>
      </div>

      <div className='px-4 grid gap-4'>
        {slicedItems.map((item: any) => {
          let activeMission;
          let groupMission;

          if (Array.isArray(missionLog.data)) {
            activeMission = missionLog.data.find(
              (log: any) => log.mission_id === item._id && log.status === 'active'
            );

            groupMission = missionLog.data.find(
              (log: any) => log.status === 'active' && log.missionDetails.session === item.session
            );
          }

          const canReceiveMission = !groupMission;

          return (
            <div key={item._id} className='grid border-[1px] border-solid rounded-lg shadow-sm'>
              {activeMission ? (
                <DialogMissionActive
                  data={item}
                  onExpire={handleExpire}
                  log={activeMission}
                  missionCache={missionCache}
                />
              ) : (
                canReceiveMission ? (
                  <DialogMission
                    data={item}
                    userId={profile.data.userId}
                    tel={profile.data.tel}
                  />
                ) : (
                  <DialogMissionWait
                    data={item}
                    mission={groupMission}
                  />
                )
              )}
            </div>
          );
        })}
      </div>

      <Pagination
        count={Math.ceil(sortedItems.length / ITEMS_PER_PAGE)}
        page={page}
        shape='rounded'
        color='primary'
        onChange={handleChangePage}
        className='px-4 mt-4 mb-8 flex justify-center'
      />
    </>
  );
}
