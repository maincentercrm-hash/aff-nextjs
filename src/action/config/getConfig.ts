// app/actions/getConfig.ts
import type { Config, ConfigResponse } from "@/types/typeConfig"

export async function getConfig() {
  try {
    // ปรับการ fetch ให้ไม่ใช้ cache
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/configs`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    const result: ConfigResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch config');
    }

    // สร้าง menuItems จาก config
    const menuItems = [
      {
        title: 'Online Marketing',
        img: result.data.menu_icon?.online_marketing?.icon || '/images/icons/online-marketing.png',
        url: '/liff/marketing'
      },
      {
        title: 'Community',
        img: result.data.menu_icon?.community?.icon || '/images/icons/community.png',
        url: '/liff/community'
      },
      {
        title: 'Mission',
        img: result.data.menu_icon?.mission?.icon || '/images/icons/mission.png',
        url: '/liff/mission'
      },
      {
        title: 'Report',
        img: result.data.menu_icon?.report?.icon || '/images/icons/report.png',
        url: '/liff/report'
      },
      {
        title: 'Setting',
        img: result.data.menu_icon?.setting?.icon || '/images/icons/setting.png',
        url: '/liff/setting'
      },
      {
        title: 'Support',
        img: result.data.menu_icon?.support?.icon || '/images/icons/support.png',
        url: '/liff/support'
      },
      {
        title: 'Point',
        img: result.data.menu_icon?.point?.icon || '/images/icons/point.png',
        url: '/liff/point'
      }
    ];

    return {
      config: result.data,
      menuItems,
      status: 'success' as const
    };

  } catch (error) {
    console.error('Failed to fetch config:', error);

    // Default menuItems สำหรับ fallback
    const defaultMenuItems = [
      { title: 'Online Marketing', img: '/images/icons/online-marketing.png', url: '/liff/marketing' },
      { title: 'Community', img: '/images/icons/community.png', url: '/liff/community' },
      { title: 'Mission', img: '/images/icons/mission.png', url: '/liff/mission' },
      { title: 'Report', img: '/images/icons/report.png', url: '/liff/report' },
      { title: 'Setting', img: '/images/icons/setting.png', url: '/liff/setting' },
      { title: 'Support', img: '/images/icons/support.png', url: '/liff/support' },
      { title: 'Point', img: '/images/icons/point.png', url: '/liff/point' }
    ];

    return {
      config: null,
      menuItems: defaultMenuItems,
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export type GetConfigReturn =
  | {
    config: Config;
    menuItems: Array<{ title: string; img: string; url: string; }>;
    status: 'success';
  }
  | {
    config: null;
    menuItems: Array<{ title: string; img: string; url: string; }>;
    status: 'error';
    error: string;
  }

// ป้องกัน cache ในระดับ route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
