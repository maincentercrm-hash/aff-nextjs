'use client'

import React, { useState } from 'react';

import { Pagination } from '@mui/material';

import NavTop from '@/components/liff/NavTop';
import LiffBox from '@/components/liff/LiffBox';
import BannerTitle from '@/components/liff/marketing/BannerTitle';
import LiffBoxRound from '@/components/liff/LiffBoxRound';
import BoxCard from '@/components/liff/marketing/BoxCard';
import Loading from '@/components/Loading';
import useReadKey from '@/action/crud/readByKey';
import { useSiteConfig } from '@/components/contexts/ConfigContext';

export default function Page() {

  const { config } = useSiteConfig();

  const items = useReadKey('tbl_online_marketings', 'status', 'publish');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;


  //console.log('items', config)

  if (items.status === 'pending') return <Loading />;

  // ตรวจสอบว่าไม่มีข้อมูลหรือ array ว่าง
  // ตรวจสอบ response ใหม่
  if (items.data.status === false) {
    return (
      <>
        <NavTop title='ONLINE MARKETING' />
        <LiffBox bg={`${config?.online_marketing.bg_image}` || '/images/pages/bg-online-marketing.jpg'}>
          <BannerTitle
            init={{
              img: config?.online_marketing.icon_image || `/images/pages/obj-online-marketing.png`,
              title: 'ONLINE MARKETING',
              excerpt: 'update ประชาสัมพันธ์ ข่าวสาร'
            }}
          />
        </LiffBox>
        <div className="p-4 text-center">
          <span>{'ไม่พบข้อมูล'}</span>
        </div>
      </>
    );
  }

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const slicedItems = items.data.slice(startIndex, endIndex);

  const data = {
    init: {
      img: '/images/pages/obj-online-marketing.png',
      title: 'ONLINE MARKETING',
      excerpt: 'update ประชาสัมพันธ์ ข่าวสาร'
    },
    items: slicedItems
  };

  return (
    <>
      <NavTop title='ONLINE MARKETING' />
      <LiffBox bg="/images/pages/bg-online-marketing.jpg">
        <BannerTitle init={data.init} />
      </LiffBox>
      <LiffBoxRound cols={2}>
        <BoxCard items={data.items} />
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
  );
}
