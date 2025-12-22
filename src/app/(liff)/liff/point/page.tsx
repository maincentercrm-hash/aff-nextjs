'use client'
import { useContext, useState } from "react";

import Pagination from "@mui/material/Pagination";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import LiffBox from "@/components/liff/LiffBox";
import NavTop from "@/components/liff/NavTop";

import { LineProfile } from "@/components/liffLogin/VerifyProfile";
import useReadBy from "@/action/crud/readBy";

import Loading from "@/components/Loading";
import SectionPoint from "@/components/liff/point/sectionPoint";

import LiffBoxRound from "@/components/liff/LiffBoxRound";

import RewardCard from "@/components/liff/point/RewardCard";
import PointLogList from "@/components/liff/point/PointLogList";
import useReadKey from "@/action/crud/readByKey";
import { useSiteConfig } from "@/components/contexts/ConfigContext";

export default function Page() {

  const { config } = useSiteConfig();

  const { userId } = useContext(LineProfile);

  const profile = useReadBy('tbl_client', userId);
  const clientPoint = useReadBy('tbl_client_point', profile.data?.tel);

  const items = useReadKey('tbl_point', 'status', 'publish');
  const pointLogs = useReadKey('tbl_point_logs', 'tel', profile.data?.tel || '');

  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);

  if (profile.status === 'pending') return <Loading />;
  if (!profile.data) return <span>ไม่พบข้อมูล</span>;

  if (clientPoint.status === 'pending') return <Loading />;
  if (!clientPoint.data) return <span>ไม่พบข้อมูล</span>;

  if (items.status === 'pending') return <Loading />;

  const handleChangePage = (_event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
  };

  const ITEMS_PER_PAGE = 4;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const rewardItems = items.data?.status === false ? [] : items.data || [];
  const slicedItems = rewardItems.slice(startIndex, endIndex);

  const data = {
    init: {
      img: config?.point.icon_image || '/images/pages/obj-point.png',
      bg: config?.point.bg_image || '/images/pages/bg-point.jpg',
      point: clientPoint.data.point,
      title: 'คงเหลือ',
      tel: clientPoint.data.tel
    },
    items: slicedItems
  };

  const logs = pointLogs.data?.status === false ? [] : pointLogs.data || [];

  return (
    <>
      <NavTop title='POINT' />

      {clientPoint.data && (
        <>
          <LiffBox bg={data.init.bg}>
            <SectionPoint init={data.init} />
          </LiffBox>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 'bold',
                  fontSize: '14px'
                }
              }}
            >
              <Tab label="ของรางวัล" />
              <Tab label="ประวัติ Point" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <>
              {rewardItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="tabler-gift text-4xl mb-2 block"></i>
                  <p>ไม่พบรายการของรางวัล</p>
                </div>
              ) : (
                <>
                  <LiffBoxRound cols={2}>
                    <RewardCard
                      items={data.items}
                      currentPoint={clientPoint.data.point}
                      tel={data.init.tel}
                      userId={profile.data.userId}
                    />
                  </LiffBoxRound>

                  <Pagination
                    count={Math.ceil(rewardItems.length / ITEMS_PER_PAGE)}
                    page={page}
                    shape='rounded'
                    color='primary'
                    onChange={handleChangePage}
                    className='px-4 mt-4 mb-8 flex justify-center'
                  />
                </>
              )}
            </>
          )}

          {tabValue === 1 && (
            <PointLogList logs={logs} />
          )}
        </>
      )}
    </>
  )
}
