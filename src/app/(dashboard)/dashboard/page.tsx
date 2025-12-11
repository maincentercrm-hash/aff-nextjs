'use client'

import useReadLimit from "@/action/crud/readLimit";
import RechartsBarChart from "@/components/dashboard/chart/RechartsBarChart";
import MissionReport from "@/components/dashboard/report/MainReport";

export default function Page() {
  const itemsUsers = useReadLimit('tbl_client')
  const itemsMission = useReadLimit('tbl_mission_logs')
  const itemsPoint = useReadLimit('tbl_point_logs')

  // เช็คแค่การโหลดข้อมูล
  if (itemsUsers.status === 'pending' ||
    itemsMission.status === 'pending' ||
    itemsPoint.status === 'pending') {
    return <span>กำลังโหลดข้อมูล...</span>
  }

  // ถ้าไม่ใช่ array ให้ใช้ array ว่าง
  const users = Array.isArray(itemsUsers.data) ? itemsUsers.data : [];
  const missions = Array.isArray(itemsMission.data) ? itemsMission.data : [];
  const points = Array.isArray(itemsPoint.data) ? itemsPoint.data : [];

  return (
    <div className="grid grid-cols-1 gap-4">
      <MissionReport />

      <RechartsBarChart
        itemsUsers={users}
        itemsMission={missions}
        itemsPoint={points}
      />
    </div>

  )
}
