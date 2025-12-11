'use client'
import { useContext, useState } from "react";

import Pagination from "@mui/material/Pagination";

import LiffBox from "@/components/liff/LiffBox";
import NavTop from "@/components/liff/NavTop";

import { LineProfile } from "@/components/liffLogin/VerifyProfile";
import useReadBy from "@/action/crud/readBy";

import Loading from "@/components/Loading";
import SectionPoint from "@/components/liff/point/sectionPoint";

import LiffBoxRound from "@/components/liff/LiffBoxRound";

import RewardCard from "@/components/liff/point/RewardCard";
import useReadKey from "@/action/crud/readByKey";
import { useSiteConfig } from "@/components/contexts/ConfigContext";

export default function Page() {

  const { config } = useSiteConfig();


  const { userId } = useContext(LineProfile);

  const profile = useReadBy('tbl_client', userId);
  const clientPoint = useReadBy('tbl_client_point', profile.data?.tel);

  const items = useReadKey('tbl_point', 'status', 'publish');

  const [page, setPage] = useState(1);

  if (profile.status === 'pending') return <Loading />;
  if (!profile.data) return <span>ไม่พบข้อมูล</span>;

  if (clientPoint.status === 'pending') return <Loading />;
  if (!clientPoint.data) return <span>ไม่พบข้อมูล</span>;

  if (items.status === 'pending') return <Loading />;


  if (items.data.status === false) {
    return (
      <>
        <NavTop title='POINT' />
        <div className="p-4 text-center">
          <span>{'ไม่พบรายการของรางวัล'}</span>
        </div>
      </>
    )
  }

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const ITEMS_PER_PAGE = 4;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const slicedItems = items.data.slice(startIndex, endIndex);

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



  return (
    <>
      <NavTop title='POINT' />

      {clientPoint.data &&

        <>
          <LiffBox bg={data.init.bg} >
            <SectionPoint init={data.init} />
          </LiffBox>

          <LiffBoxRound cols={2}>
            <RewardCard items={data.items} currentPoint={clientPoint.data.point} tel={data.init.tel} userId={profile.data.userId} />

          </LiffBoxRound>

          <Pagination
            count={Math.ceil(items.data.length / ITEMS_PER_PAGE)}
            page={page}

            shape='rounded'
            color='primary'
            onChange={handleChangePage}
            className='px-4 mt-4 mb-8 flex justify-center'
          />
        </>
      }
    </>

  )
}
